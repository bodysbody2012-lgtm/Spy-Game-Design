import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { api } from "@shared/routes";
import { z } from "zod";
import { eq } from "drizzle-orm";
import session from "express-session";
import MemoryStore from "memorystore";

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
  const SessionStore = MemoryStore(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "spygame_secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000,
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
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
    if (!req.session.userId || !req.session.isAdmin) {
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
    res.json(user);
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
    res.status(201).json(user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.users.list.path, requireAuth, async (req, res) => {
    const usersList = await storage.getAllUsers();
    // Admin sees all passwords, users see only their own record with password (for private leaderboard concept)
    const result = usersList.map(u => {
      if (req.session.isAdmin || req.session.userId === u.id) {
        return u;
      }
      const { password, ...rest } = u;
      return rest;
    });
    res.json(result);
  });

  app.delete(api.users.delete.path, requireAuth, async (req, res) => {
    const targetId = Number(req.params.id);
    if (!req.session.isAdmin && req.session.userId !== targetId) {
      return res.status(403).json({ message: "Forbidden" });
    }
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

  app.post(api.stats.visit.path, async (req, res) => {
    const stats = await storage.incrementVisits();
    res.json(stats);
  });

  const admin = await storage.getUserByUsername("admin");
  if (!admin) {
    await storage.createUser({ username: "admin", password: "123789", isAdmin: true });
  } else if (admin.password !== "123789") {
    await db.update(users).set({ password: "123789" }).where(eq(users.id, admin.id));
  }

  return httpServer;
}
