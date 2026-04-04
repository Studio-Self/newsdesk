import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { assetService } from "../services/assets.js";

export function assetRoutes(db: Db) {
  const router = Router();
  const service = assetService(db);

  router.get("/newsrooms/:newsroomId/assets", async (req, res) => {
    const rows = await service.list(req.params.newsroomId, req.query.storyId as string | undefined);
    res.json(rows);
  });

  router.get("/assets/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Asset not found" });
    res.json(row);
  });

  router.post("/newsrooms/:newsroomId/assets", async (req, res) => {
    const { filename, mimeType, sizeBytes, storagePath, storyId, altText, caption, uploadedBy } = req.body;
    if (!filename || !mimeType || !sizeBytes || !storagePath) {
      return res.status(400).json({ error: "filename, mimeType, sizeBytes, and storagePath required" });
    }
    const row = await service.create({
      newsroomId: req.params.newsroomId, filename, mimeType, sizeBytes, storagePath, storyId, altText, caption, uploadedBy,
    });
    res.status(201).json(row);
  });

  router.delete("/assets/:id", async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  });

  return router;
}
