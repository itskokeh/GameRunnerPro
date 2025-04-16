import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the users table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").notNull().unique(),
  highScore: integer("high_score").notNull().default(0),
  avatarUrl: text("avatar_url"),
});

// Create insert schema for users
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Define types for the user schema
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
