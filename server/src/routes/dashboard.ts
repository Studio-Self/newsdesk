import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { dashboardService } from "../services/dashboard.js";

export function dashboardRoutes(db: Db) {
  const router = Router();
  const service = dashboardService(db);

  router.get("/newsrooms/:newsroomId/dashboard", async (req, res) => {
    const summary = await service.summary(req.params.newsroomId);
    res.json(summary);
  });

  return router;
}
