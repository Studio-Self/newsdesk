import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { secretService } from "../services/secrets.js";

export function secretRoutes(db: Db) {
  const router = Router();
  const service = secretService(db);

  router.get("/newsrooms/:newsroomId/secrets", async (req, res) => {
    const rows = await service.list(req.params.newsroomId);
    res.json(rows);
  });

  router.get("/newsrooms/:newsroomId/secrets/:key", async (req, res) => {
    const row = await service.get(req.params.newsroomId, req.params.key);
    if (!row) return res.status(404).json({ error: "Secret not found" });
    res.json(row);
  });

  router.put("/newsrooms/:newsroomId/secrets/:key", async (req, res) => {
    const { value } = req.body;
    if (!value) return res.status(400).json({ error: "value required" });
    const row = await service.set(req.params.newsroomId, req.params.key, value);
    res.json(row);
  });

  router.delete("/newsrooms/:newsroomId/secrets/:key", async (req, res) => {
    await service.delete(req.params.newsroomId, req.params.key);
    res.status(204).end();
  });

  return router;
}
