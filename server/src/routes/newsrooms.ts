import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { newsroomService } from "../services/newsrooms.js";

export function newsroomRoutes(db: Db) {
  const router = Router();
  const service = newsroomService(db);

  router.get("/", async (_req, res) => {
    const rows = await service.list();
    res.json(rows);
  });

  router.get("/:id", async (req, res) => {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Newsroom not found" });
    res.json(row);
  });

  router.post("/", async (req, res) => {
    const { name, slug, description } = req.body;
    if (!name || !slug) return res.status(400).json({ error: "name and slug required" });
    const row = await service.create({ name, slug, description });
    res.status(201).json(row);
  });

  router.patch("/:id", async (req, res) => {
    const row = await service.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Newsroom not found" });
    res.json(row);
  });

  router.delete("/:id", async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  });

  return router;
}
