import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { agentService } from "../services/agents.js";

export function agentRoutes(db: Db) {
  const router = Router();
  const service = agentService(db);

  router.get("/newsrooms/:newsroomId/agents", async (req, res) => {
    const rows = await service.list(req.params.newsroomId);
    res.json(rows);
  });

  router.get("/agents/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Agent not found" });
    res.json(row);
  });

  router.post("/newsrooms/:newsroomId/agents", async (req, res) => {
    const { name, role, title, icon, adapterType, adapterConfig, budgetMonthlyCents } = req.body;
    if (!name || !role) return res.status(400).json({ error: "name and role required" });
    const row = await service.create({
      newsroomId: req.params.newsroomId,
      name,
      role,
      title,
      icon,
      adapterType,
      adapterConfig,
      budgetMonthlyCents,
    });
    res.status(201).json(row);
  });

  router.patch("/agents/:id", async (req, res) => {
    const row = await service.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Agent not found" });
    res.json(row);
  });

  router.delete("/agents/:id", async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  });

  return router;
}
