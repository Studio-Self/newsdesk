import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { taskService } from "../services/tasks.js";

export function taskRoutes(db: Db) {
  const router = Router();
  const service = taskService(db);

  router.get("/newsrooms/:newsroomId/tasks", async (req, res) => {
    const { status, type, assigneeAgentId, storyId } = req.query;
    const rows = await service.list(req.params.newsroomId, {
      status: status as string | undefined,
      type: type as string | undefined,
      assigneeAgentId: assigneeAgentId as string | undefined,
      storyId: storyId as string | undefined,
    });
    res.json(rows);
  });

  router.get("/tasks/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Task not found" });
    res.json(row);
  });

  router.post("/newsrooms/:newsroomId/tasks", async (req, res) => {
    const { title, description, type, priority, storyId, assigneeAgentId, createdByAgentId, labels, dueAt } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const row = await service.create({
      newsroomId: req.params.newsroomId,
      title, description, type, priority, storyId, assigneeAgentId, createdByAgentId, labels, dueAt,
    });
    res.status(201).json(row);
  });

  router.patch("/tasks/:id", async (req, res) => {
    const row = await service.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Task not found" });
    res.json(row);
  });

  router.delete("/tasks/:id", async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  });

  router.get("/tasks/:id/comments", async (req, res) => {
    const rows = await service.listComments(req.params.id);
    res.json(rows);
  });

  router.post("/tasks/:id/comments", async (req, res) => {
    const { agentId, authorName, body } = req.body;
    if (!body) return res.status(400).json({ error: "body required" });
    const row = await service.addComment({ taskId: req.params.id, agentId, authorName, body });
    res.status(201).json(row);
  });

  return router;
}
