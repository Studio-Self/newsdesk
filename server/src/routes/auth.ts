import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { userService } from "../services/users.js";
import { sessionService } from "../services/sessions.js";

export function authRoutes(db: Db) {
  const router = Router();
  const userSvc = userService(db);
  const sessionSvc = sessionService(db);

  router.post("/register", async (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) return res.status(400).json({ error: "email, name, and password required" });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

    const existing = await userSvc.getByEmail(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const user = await userSvc.create({ email, name, password });
    const session = await sessionSvc.create(user.id);

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      token: session.token,
    });
  });

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await userSvc.authenticate(email, password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const session = await sessionSvc.create(user.id);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      token: session.token,
    });
  });

  router.post("/logout", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      await sessionSvc.delete(authHeader.slice(7));
    }
    res.status(204).end();
  });

  router.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });

    const session = await sessionSvc.validate(authHeader.slice(7));
    if (!session) return res.status(401).json({ error: "Invalid session" });

    const user = await userSvc.getById(session.userId);
    if (!user) return res.status(401).json({ error: "User not found" });

    res.json({ id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl });
  });

  return router;
}
