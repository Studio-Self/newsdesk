import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { budgetPolicyService } from "../services/budget-policies.js";

export function budgetPolicyRoutes(db: Db) {
  const router = Router();
  const service = budgetPolicyService(db);

  router.get("/newsrooms/:newsroomId/budget-policies", async (req, res) => {
    const rows = await service.list(req.params.newsroomId);
    res.json(rows);
  });

  router.get("/budget-policies/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Budget policy not found" });
    res.json(row);
  });

  router.post("/newsrooms/:newsroomId/budget-policies", async (req, res) => {
    const { name, scope, scopeId, limitCents, periodDays, alertThresholdPct } = req.body;
    if (!name || !limitCents) return res.status(400).json({ error: "name and limitCents required" });
    const row = await service.create({ newsroomId: req.params.newsroomId, name, scope, scopeId, limitCents, periodDays, alertThresholdPct });
    res.status(201).json(row);
  });

  router.patch("/budget-policies/:id", async (req, res) => {
    const row = await service.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Budget policy not found" });
    res.json(row);
  });

  router.delete("/budget-policies/:id", async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  });

  router.get("/newsrooms/:newsroomId/budget-incidents", async (req, res) => {
    const rows = await service.listIncidents(req.params.newsroomId);
    res.json(rows);
  });

  return router;
}
