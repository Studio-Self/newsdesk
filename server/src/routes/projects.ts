import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { projectService } from "../services/projects.js";

export function projectRoutes(db: Db) {
  const router = Router();
  const service = projectService(db);

  router.get("/newsrooms/:newsroomId/projects", async (req, res) => {
    const rows = await service.list(req.params.newsroomId, req.query.status as string | undefined);
    res.json(rows);
  });

  router.get("/projects/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Project not found" });
    res.json(row);
  });

  router.post("/newsrooms/:newsroomId/projects", async (req, res) => {
    const { title, slug, description, leadAgentId } = req.body;
    if (!title || !slug) return res.status(400).json({ error: "title and slug required" });
    const row = await service.create({ newsroomId: req.params.newsroomId, title, slug, description, leadAgentId });
    res.status(201).json(row);
  });

  router.patch("/projects/:id", async (req, res) => {
    const row = await service.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Project not found" });
    res.json(row);
  });

  router.delete("/projects/:id", async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  });

  router.get("/projects/:id/goals", async (req, res) => {
    const rows = await service.listGoals(req.params.id);
    res.json(rows);
  });

  router.post("/projects/:id/goals", async (req, res) => {
    const { goalId } = req.body;
    if (!goalId) return res.status(400).json({ error: "goalId required" });
    const row = await service.linkGoal(req.params.id, goalId);
    res.status(201).json(row);
  });

  router.get("/projects/:id/stories", async (req, res) => {
    const rows = await service.listStories(req.params.id);
    res.json(rows);
  });

  router.post("/projects/:id/stories", async (req, res) => {
    const { storyId } = req.body;
    if (!storyId) return res.status(400).json({ error: "storyId required" });
    const row = await service.linkStory(req.params.id, storyId);
    res.status(201).json(row);
  });

  return router;
}
