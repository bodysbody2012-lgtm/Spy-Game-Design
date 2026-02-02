import { db } from "./db";
import { users, siteStats, type User, type InsertUser } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { isAdmin?: boolean }): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  updateUserScore(id: number, points: number): Promise<User>;
  incrementTokenVersion(id: number): Promise<void>;
  
  // Stats
  getStats(): Promise<{ visits: number }>;
  incrementVisits(): Promise<{ visits: number }>;
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
      tokenVersion: 0
    }).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.username);
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
      return newStats;
    }
    return stats;
  }

  async incrementVisits(): Promise<{ visits: number }> {
    const [stats] = await db.select().from(siteStats);
    if (!stats) {
      const [newStats] = await db.insert(siteStats).values({ visits: 1 }).returning();
      return newStats;
    }
    const [updated] = await db.update(siteStats)
      .set({ visits: sql`${siteStats.visits} + 1` })
      .where(eq(siteStats.id, stats.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
