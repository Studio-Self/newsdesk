import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { costService } from "../services/costs.js";

export function costRoutes(db: Db) {
  const router = Router();
  const service = costService(db);

  router.get("/newsrooms/:newsroomId/costs", async (req, res) => {
    const rows = await service.list(req.params.newsroomId);
    res.json(rows);
  });

  router.get("/newsrooms/:newsroomId/costs/total", async (req, res) => {
    const total = await service.totalForNewsroom(req.params.newsroomId);
    const avgPerArticle = await service.avgCostPerArticle(req.params.newsroomId);
    res.json({ totalCents: total, avgCostPerArticleCents: avgPerArticle });
  });

  return router;
}
