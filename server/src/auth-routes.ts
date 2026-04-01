import type { Express } from "express";
import type { Server } from "http";
import { auth } from "../src/auth";
import { toNodeHandler } from "better-auth/node";

export async function registerAuthRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Better Auth handlers - all auth routes under /api/auth
  app.all("/api/auth/**", toNodeHandler(auth));
  
  return httpServer;
}