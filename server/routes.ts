import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server for the Express app
  const httpServer = createServer(app);

  // ==== User Routes ====
  
  // Get user by Google ID
  app.get("/api/users/google/:googleId", async (req, res) => {
    try {
      const { googleId } = req.params;
      const user = await storage.getUserByGoogleId(googleId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new user
  app.post("/api/users", async (req, res) => {
    try {
      // Validate request body against schema
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists with this Google ID
      const existingUser = await storage.getUserByGoogleId(userData.googleId);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      // Create the user
      const newUser = await storage.createUser(userData);
      return res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        return res.status(400).json({ 
          message: "Validation error", 
          details: fromZodError(error).message 
        });
      }
      
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user's high score
  app.put("/api/users/:id/highscore", async (req, res) => {
    try {
      const { id } = req.params;
      const { score } = req.body;
      
      if (typeof score !== 'number' || score < 0) {
        return res.status(400).json({ message: "Invalid score value" });
      }
      
      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get user to check existence
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update high score
      const updatedUser = await storage.updateHighScore(userId, score);
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating high score:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get top scores
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({ message: "Invalid limit parameter" });
      }
      
      const topScores = await storage.getTopScores(limit);
      return res.status(200).json(topScores);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
