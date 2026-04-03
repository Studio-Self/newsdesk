import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { assignmentService } from "../services/assignments.js";

export function assignmentRoutes(db: Db) {
  const router = Router();
  const service = assignmentService(db);

  router.get("/newsrooms/:newsroomId/assignments", async (req, res) => {
    const rows = await service.list(req.params.newsroomId, req.query.status as string | undefined);
    res.json(rows);
  });

  router.get("/assignments/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Assignment not found" });
    res.json(row);
  });

  router.post("/newsrooms/:newsroomId/assignments", async (req, res) => {
    const { title, description, beatId, assignedByAgentId, priority } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const row = await service.create({
      newsroomId: req.params.newsroomId,
      title,
      description,
      beatId,
      assignedByAgentId,
      priority,
    });
    res.status(201).json(row);
  });

  router.patch("/assignments/:id", async (req, res) => {
    const row = await service.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Assignment not found" });
    res.json(row);
  });

  return router;
}
