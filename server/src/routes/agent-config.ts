import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { agentConfigService } from "../services/agent-config.js";

export function agentConfigRoutes(db: Db) {
  const router = Router();
  const service = agentConfigService(db);

  router.get("/agents/:agentId/config/revisions", async (req, res) => {
    const rows = await service.listRevisions(req.params.agentId);
    res.json(rows);
  });

  router.post("/agents/:agentId/config/revisions", async (req, res) => {
    const { config, changedBy, changeNotes } = req.body;
    if (!config) return res.status(400).json({ error: "config required" });
    const row = await service.createRevision({ agentId: req.params.agentId, config, changedBy, changeNotes });
    res.status(201).json(row);
  });

  router.get("/agents/:agentId/config/revisions/:revision", async (req, res) => {
    const row = await service.getRevision(req.params.agentId, parseInt(req.params.revision));
    if (!row) return res.status(404).json({ error: "Revision not found" });
    res.json(row);
  });

  router.get("/agents/:agentId/state", async (req, res) => {
    const row = await service.getState(req.params.agentId);
    res.json(row ?? { agentId: req.params.agentId, state: {} });
  });

  router.put("/agents/:agentId/state", async (req, res) => {
    const { state } = req.body;
    if (!state) return res.status(400).json({ error: "state required" });
    const row = await service.setState(req.params.agentId, state);
    res.json(row);
  });

  router.patch("/agents/:agentId/state", async (req, res) => {
    const row = await service.patchState(req.params.agentId, req.body);
    res.json(row);
  });

  return router;
}
