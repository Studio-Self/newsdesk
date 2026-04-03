import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { beatService } from "../services/beats.js";

export function beatRoutes(db: Db) {
  const router = Router();
  const service = beatService(db);

  router.get("/newsrooms/:newsroomId/beats", async (req, res) => {
    const rows = await service.list(req.params.newsroomId);
    res.json(rows);
  });

  router.get("/beats/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Beat not found" });
    res.json(row);
  });

  router.post("/newsrooms/:newsroomId/beats", async (req, res) => {
    const { name, slug, description } = req.body;
    if (!name || !slug) return res.status(400).json({ error: "name and slug required" });
    const row = await service.create({ newsroomId: req.params.newsroomId, name, slug, description });
    res.status(201).json(row);
  });

  router.patch("/beats/:id", async (req, res) => {
    const row = await service.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Beat not found" });
    res.json(row);
  });

  router.delete("/beats/:id", async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  });

  return router;
}
