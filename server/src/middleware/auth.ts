import type { Request, Response, NextFunction } from "express";
import type { Db } from "@newsdesk/db";
import { sessionService } from "../services/sessions.js";
import { userService } from "../services/users.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userName?: string;
    }
  }
}

export function authMiddleware(db: Db) {
  const sessions = sessionService(db);
  const users = userService(db);

  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.slice(7);
    const session = await sessions.validate(token);
    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const user = await users.getById(session.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User not found or inactive" });
    }

    req.userId = user.id;
    req.userEmail = user.email;
    req.userName = user.name;
    next();
  };
}
