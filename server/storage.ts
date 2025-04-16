import { users, type User, type InsertUser } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User related operations
  getUser(id: number): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateHighScore(userId: number, score: number): Promise<User>;
  getTopScores(limit: number): Promise<User[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  // Get user by ID
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  // Get user by Google ID
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  // Create a new user
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Update user's high score if the new score is higher
  async updateHighScore(userId: number, score: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Only update if the new score is higher
    if (score > user.highScore) {
      const updatedUser = { ...user, highScore: score };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }

    return user;
  }

  // Get top scores
  async getTopScores(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.highScore - a.highScore)
      .slice(0, limit);
  }
}

// Create and export the storage instance
export const storage = new MemStorage();
