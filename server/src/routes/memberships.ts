import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { membershipService } from "../services/memberships.js";

export function membershipRoutes(db: Db) {
  const router = Router();
  const service = membershipService(db);

  router.get("/newsrooms/:newsroomId/members", async (req, res) => {
    const rows = await service.listForNewsroom(req.params.newsroomId);
    res.json(rows);
  });

  router.post("/newsrooms/:newsroomId/members", async (req, res) => {
    const { userId, role } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const row = await service.create({ userId, newsroomId: req.params.newsroomId, role });
    res.status(201).json(row);
  });

  router.patch("/newsrooms/:newsroomId/members/:userId", async (req, res) => {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "role required" });
    const row = await service.updateRole(req.params.userId, req.params.newsroomId, role);
    if (!row) return res.status(404).json({ error: "Membership not found" });
    res.json(row);
  });

  router.delete("/newsrooms/:newsroomId/members/:userId", async (req, res) => {
    await service.delete(req.params.userId, req.params.newsroomId);
    res.status(204).end();
  });

  return router;
}
