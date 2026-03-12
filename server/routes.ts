import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { api } from "@shared/routes";
import { z } from "zod";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";

const CHAT_TRIGGER = "444422";
const CHAT_ADMIN_TRIGGER = "444444";

// Setup voice storage - use /tmp in production (app dir is read-only)
const voiceDir = process.env.NODE_ENV === "production"
  ? path.join("/tmp", "voice")
  : path.join(process.cwd(), "server", "uploads", "voice");
if (!fs.existsSync(voiceDir)) fs.mkdirSync(voiceDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, voiceDir),
    filename: (_req, file, cb) => cb(null, `voice_${Date.now()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// WebSocket clients for chat broadcast
const chatClients = new Set<WebSocket>();

function broadcastChat(data: object) {
  const msg = JSON.stringify(data);
  chatClients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(msg); });
}

declare module "express-session" {
  interface SessionData {
    userId: number;
    tokenVersion: number;
    isAdmin: boolean;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PostgresStore = connectPgSimple(session);
  let sessionStore: session.Store;
  try {
    sessionStore = new PostgresStore({ pool, tableName: "session" });
  } catch (err) {
    console.error("[session] PostgresStore init failed, using MemoryStore:", err);
    sessionStore = new session.MemoryStore();
  }
  
  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "spygame_secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
    })
  );

  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || user.tokenVersion !== req.session.tokenVersion) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Session expired or invalid" });
    }
    next();
  };

  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  app.post(api.auth.login.path, async (req, res) => {
    const { username, password } = api.auth.login.input.parse(req.body);
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    req.session.userId = user.id;
    req.session.tokenVersion = user.tokenVersion || 0;
    req.session.isAdmin = user.isAdmin || false;
    
    // Explicitly save session
    req.session.save((err) => {
      if (err) return res.status(500).json({ message: "Session error" });
      res.json(user);
    });
  });

  app.post(api.auth.register.path, async (req, res) => {
    const input = api.auth.register.input.parse(req.body);
    const existing = await storage.getUserByUsername(input.username);
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const user = await storage.createUser(input);
    req.session.userId = user.id;
    req.session.tokenVersion = user.tokenVersion || 0;
    req.session.isAdmin = user.isAdmin || false;
    
    req.session.save((err) => {
      if (err) return res.status(500).json({ message: "Session error" });
      res.status(201).json(user);
    });
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.users.list.path, requireAuth, async (req, res) => {
    const usersList = await storage.getLeaderboard();
    const currentUser = await storage.getUser(req.session.userId!);
    
    const result = usersList.map(u => {
      if (currentUser?.isAdmin || req.session.userId === u.id) {
        return u;
      }
      const { password, ...rest } = u;
      return rest;
    });
    res.json(result);
  });

  app.delete(api.users.delete.path, requireAdmin, async (req, res) => {
    const targetId = Number(req.params.id);
    await storage.deleteUser(targetId);
    res.json({ message: "User deleted" });
  });

  app.patch(api.users.updateScore.path, requireAuth, async (req, res) => {
    const user = await storage.updateUserScore(Number(req.params.id), req.body.points);
    res.json(user);
  });

  app.get(api.admin.stats.path, requireAdmin, async (req, res) => {
    const stats = await storage.getStats();
    const usersCount = (await storage.getAllUsers()).length;
    res.json({ visits: stats.visits, totalUsers: usersCount });
  });

  app.post(api.admin.logoutUser.path, requireAdmin, async (req, res) => {
    await storage.incrementTokenVersion(Number(req.params.id));
    res.json({ message: "User forced logout" });
  });

  app.post(api.admin.resetVisits.path, requireAdmin, async (req, res) => {
    await storage.resetVisits();
    res.json({ message: "Visits reset successfully" });
  });

  app.post(api.stats.visit.path, async (req, res) => {
    const { userId } = req.body || {};
    const stats = await storage.incrementVisits(userId);
    res.json(stats);
  });

  // === CHAT ROUTES ===

  // Serve voice files
  app.use("/api/chat/voice", (req, res, next) => {
    const filePath = path.join(voiceDir, path.basename(req.path));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  // Get chat history
  app.get("/api/chat/messages", async (_req, res) => {
    const messages = await storage.getChatMessages(200);
    res.json(messages);
  });

  // Send text message
  app.post("/api/chat/messages", async (req, res) => {
    const { senderAlias, deviceId, content } = req.body;
    if (!senderAlias || !deviceId || !content?.trim()) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const msg = await storage.addChatMessage({ senderAlias, deviceId, content: content.trim(), type: "text" });
    broadcastChat({ type: "new_message", message: msg });
    res.json(msg);
  });

  // Upload voice message
  app.post("/api/chat/voice", upload.single("audio"), async (req, res) => {
    const { senderAlias, deviceId } = req.body;
    if (!senderAlias || !deviceId || !req.file) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const filePath = `/api/chat/voice/${req.file.filename}`;
    const msg = await storage.addChatMessage({ senderAlias, deviceId, type: "voice", filePath });
    broadcastChat({ type: "new_message", message: msg });
    res.json(msg);
  });

  // Clear chat (admin only - device with 444444 key)
  app.delete("/api/chat/messages", async (req, res) => {
    const { adminKey } = req.body;
    if (adminKey !== CHAT_ADMIN_TRIGGER) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await storage.clearChat();
    broadcastChat({ type: "chat_cleared" });
    res.json({ message: "Chat cleared" });
  });

  // Setup WebSocket for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/chat" });
  wss.on("connection", (ws) => {
    chatClients.add(ws);
    ws.on("close", () => chatClients.delete(ws));
    ws.on("error", () => chatClients.delete(ws));
  });

  // Ensure admin user exists with correct password (with error handling)
  try {
    const admin = await storage.getUserByUsername("admin");
    if (!admin) {
      await storage.createUser({ username: "admin", password: "123789", isAdmin: true });
    } else if (admin.password !== "123789" || !admin.isAdmin) {
      await db.update(users)
        .set({ password: "123789", isAdmin: true })
        .where(eq(users.id, admin.id));
    }
  } catch (err) {
    console.error("[startup] Admin user setup failed (non-fatal):", err);
  }

  return httpServer;
}
