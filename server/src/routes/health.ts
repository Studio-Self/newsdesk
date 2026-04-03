import { Router } from "express";
import type { Db } from "@newsdesk/db";

export function healthRoutes(_db: Db) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({ status: "ok", version: "0.1.0", timestamp: new Date().toISOString() });
  });

  return router;
}
