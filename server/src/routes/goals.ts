import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { goalService } from "../services/goals.js";

export function goalRoutes(db: Db) {
  const router = Router();
  const service = goalService(db);

  router.get("/newsrooms/:newsroomId/goals", async (req, res) => {
    const rows = await service.list(req.params.newsroomId, req.query.status as string | undefined);
    res.json(rows);
  });

  router.get("/goals/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Goal not found" });
    res.json(row);
  });

  router.post("/newsrooms/:newsroomId/goals", async (req, res) => {
    const { title, description, parentGoalId, targetDate } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const row = await service.create({ newsroomId: req.params.newsroomId, title, description, parentGoalId, targetDate });
    res.status(201).json(row);
  });

  router.patch("/goals/:id", async (req, res) => {
    const row = await service.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Goal not found" });
    res.json(row);
  });

  router.delete("/goals/:id", async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  });

  return router;
}
