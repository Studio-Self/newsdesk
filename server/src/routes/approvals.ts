import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { approvalService } from "../services/approvals.js";

export function approvalRoutes(db: Db) {
  const router = Router();
  const service = approvalService(db);

  router.get("/approvals", async (req, res) => {
    const rows = await service.list({
      status: req.query.status as string | undefined,
      storyId: req.query.storyId as string | undefined,
    });
    res.json(rows);
  });

  router.get("/approvals/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Approval not found" });
    res.json(row);
  });

  router.post("/approvals", async (req, res) => {
    const { storyId, stage, requestedByAgentId } = req.body;
    if (!storyId || !stage) return res.status(400).json({ error: "storyId and stage required" });
    const row = await service.create({ storyId, stage, requestedByAgentId });
    res.status(201).json(row);
  });

  router.post("/approvals/:id/decide", async (req, res) => {
    const { status, decidedBy, decisionNotes } = req.body;
    if (!status || !decidedBy) return res.status(400).json({ error: "status and decidedBy required" });
    const row = await service.decide(req.params.id, { status, decidedBy, decisionNotes });
    if (!row) return res.status(404).json({ error: "Approval not found" });
    res.json(row);
  });

  return router;
}
