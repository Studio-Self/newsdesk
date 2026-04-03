import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { activityService } from "../services/activity.js";

export function activityRoutes(db: Db) {
  const router = Router();
  const service = activityService(db);

  router.get("/newsrooms/:newsroomId/activity", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const rows = await service.list(req.params.newsroomId, limit);
    res.json(rows);
  });

  return router;
}
