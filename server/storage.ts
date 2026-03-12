import { db } from "./db";
import { users, siteStats, chatMessages, type User, type InsertUser, type ChatMessage } from "@shared/schema";
import { eq, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { isAdmin?: boolean }): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getLeaderboard(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  updateUserScore(id: number, points: number): Promise<User>;
  incrementTokenVersion(id: number): Promise<void>;
  
  // Stats
  getStats(): Promise<{ visits: number }>;
  incrementVisits(userId?: number): Promise<{ visits: number }>;
  resetVisits(): Promise<void>;

  // Chat
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  addChatMessage(msg: { senderAlias: string; deviceId: string; content?: string; type: string; filePath?: string }): Promise<ChatMessage>;
  clearChat(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser & { isAdmin?: boolean }): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      isAdmin: insertUser.isAdmin ?? false,
      score: 0,
      gamesPlayed: 0,
      tokenVersion: 0,
      visits: 0
    }).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.username);
  }

  async getLeaderboard(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.score));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserScore(id: number, points: number): Promise<User> {
    const [user] = await db.update(users)
      .set({ 
        score: sql`${users.score} + ${points}`,
        gamesPlayed: sql`${users.gamesPlayed} + 1`
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async incrementTokenVersion(id: number): Promise<void> {
    await db.update(users)
      .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
      .where(eq(users.id, id));
  }

  async getStats(): Promise<{ visits: number }> {
    const [stats] = await db.select().from(siteStats);
    if (!stats) {
      const [newStats] = await db.insert(siteStats).values({ visits: 0 }).returning();
      return { visits: newStats.visits ?? 0 };
    }
    return { visits: stats.visits ?? 0 };
  }

  async incrementVisits(userId?: number): Promise<{ visits: number }> {
    if (userId) {
      await db.update(users)
        .set({ visits: sql`${users.visits} + 1` })
        .where(eq(users.id, userId));
    }

    const [stats] = await db.select().from(siteStats);
    if (!stats) {
      const [newStats] = await db.insert(siteStats).values({ visits: 1 }).returning();
      return { visits: newStats.visits ?? 1 };
    }
    const [updated] = await db.update(siteStats)
      .set({ visits: sql`${siteStats.visits} + 1` })
      .where(eq(siteStats.id, stats.id))
      .returning();
    return { visits: updated.visits ?? 0 };
  }

  async resetVisits(): Promise<void> {
    await db.update(siteStats).set({ visits: 0 });
    await db.update(users).set({ visits: 0 });
  }

  async getChatMessages(limit = 100): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).orderBy(asc(chatMessages.createdAt)).limit(limit);
  }

  async addChatMessage(msg: { senderAlias: string; deviceId: string; content?: string; type: string; filePath?: string }): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(msg).returning();
    return message;
  }

  async clearChat(): Promise<void> {
    await db.delete(chatMessages);
  }
}

export const storage = new DatabaseStorage();
