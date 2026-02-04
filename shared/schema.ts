import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  score: integer("score").default(0),
  gamesPlayed: integer("games_played").default(0),
  tokenVersion: integer("token_version").default(0),
  visits: integer("visits").default(0),
});

export const siteStats = pgTable("site_stats", {
  id: serial("id").primaryKey(),
  visits: integer("visits").default(0),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  isAdmin: true, 
  score: true, 
  gamesPlayed: true,
  tokenVersion: true,
  visits: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserStats = {
  id: number;
  username: string;
  score: number;
  gamesPlayed: number;
};

export type AdminUserView = User;
