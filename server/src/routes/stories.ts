import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { storyService } from "../services/stories.js";

export function storyRoutes(db: Db) {
  const router = Router();
  const service = storyService(db);

  router.get("/newsrooms/:newsroomId/stories", async (req, res) => {
    const { stage, beatId, priority } = req.query;
    const rows = await service.list(req.params.newsroomId, {
      stage: stage as string | undefined,
      beatId: beatId as string | undefined,
      priority: priority as string | undefined,
    });
    res.json(rows);
  });

  router.get("/stories/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Story not found" });
    res.json(row);
  });

  router.post("/newsrooms/:newsroomId/stories", async (req, res) => {
    const { title, description, beatId, assignmentId, priority } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const row = await service.create({
      newsroomId: req.params.newsroomId,
      title,
      description,
      beatId,
      assignmentId,
      priority,
    });
    res.status(201).json(row);
  });

  router.patch("/stories/:id", async (req, res) => {
    const row = await service.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Story not found" });
    res.json(row);
  });

  router.post("/stories/:id/transition", async (req, res) => {
    const { stage, agentId, notes } = req.body;
    if (!stage) return res.status(400).json({ error: "stage required" });
    const result = await service.transitionStage(req.params.id, stage, { agentId, notes });
    if (!result.success) {
      return res.status(400).json({ error: result.error, requiresApproval: result.requiresApproval });
    }
    res.json({ success: true });
  });

  router.get("/stories/:id/stages", async (req, res) => {
    const rows = await service.getStageHistory(req.params.id);
    res.json(rows);
  });

  router.get("/newsrooms/:newsroomId/pipeline", async (req, res) => {
    const counts = await service.getPipelineCounts(req.params.newsroomId);
    res.json(counts);
  });

  router.delete("/stories/:id", async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  });

  return router;
}
