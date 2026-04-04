import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { documentService } from "../services/documents.js";

export function documentRoutes(db: Db) {
  const router = Router();
  const service = documentService(db);

  router.get("/newsrooms/:newsroomId/documents", async (req, res) => {
    const rows = await service.list(req.params.newsroomId, req.query.category as string | undefined);
    res.json(rows);
  });

  router.get("/documents/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Document not found" });
    res.json(row);
  });

  router.post("/newsrooms/:newsroomId/documents", async (req, res) => {
    const { title, slug, body, category } = req.body;
    if (!title || !slug) return res.status(400).json({ error: "title and slug required" });
    const row = await service.create({ newsroomId: req.params.newsroomId, title, slug, body, category });
    res.status(201).json(row);
  });

  router.patch("/documents/:id", async (req, res) => {
    const row = await service.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Document not found" });
    res.json(row);
  });

  router.delete("/documents/:id", async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  });

  router.get("/documents/:id/revisions", async (req, res) => {
    const rows = await service.listRevisions(req.params.id);
    res.json(rows);
  });

  router.get("/documents/:id/revisions/:revision", async (req, res) => {
    const row = await service.getRevision(req.params.id, parseInt(req.params.revision));
    if (!row) return res.status(404).json({ error: "Revision not found" });
    res.json(row);
  });

  return router;
}
