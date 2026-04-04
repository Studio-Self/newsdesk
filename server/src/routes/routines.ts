import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { routineService } from "../services/routines.js";

export function routineRoutes(db: Db) {
  const router = Router();
  const service = routineService(db);

  router.get("/newsrooms/:newsroomId/routines", async (req, res) => {
    const rows = await service.list(req.params.newsroomId);
    res.json(rows);
  });

  router.get("/routines/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Routine not found" });
    res.json(row);
  });

  router.post("/newsrooms/:newsroomId/routines", async (req, res) => {
    const { name, description, schedule, agentId, action, actionConfig } = req.body;
    if (!name || !schedule || !action) return res.status(400).json({ error: "name, schedule, and action required" });
    const row = await service.create({ newsroomId: req.params.newsroomId, name, description, schedule, agentId, action, actionConfig });
    res.status(201).json(row);
  });

  router.patch("/routines/:id", async (req, res) => {
    const row = await service.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Routine not found" });
    res.json(row);
  });

  router.delete("/routines/:id", async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  });

  return router;
}
