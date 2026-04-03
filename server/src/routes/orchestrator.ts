import { Router } from "express";
import type { Db } from "@newsdesk/db";
import { Orchestrator } from "../orchestrator/index.js";

let orchestrator: Orchestrator | null = null;

export function orchestratorRoutes(db: Db) {
  const router = Router();

  /** POST /api/orchestrator/start — start the heartbeat loop */
  router.post("/start", (req, res) => {
    const { intervalMs, maxConcurrent, dryRun } = req.body ?? {};

    if (!orchestrator) {
      orchestrator = new Orchestrator(db, {
        intervalMs: intervalMs ?? 30_000,
        maxConcurrent: maxConcurrent ?? 5,
        dryRun: dryRun ?? false,
      });
    }

    orchestrator.start();
    res.json({ ok: true, status: orchestrator.status() });
  });

  /** POST /api/orchestrator/stop — stop the heartbeat loop */
  router.post("/stop", (_req, res) => {
    if (!orchestrator) {
      res.status(400).json({ error: "Orchestrator not initialized" });
      return;
    }
    orchestrator.stop();
    res.json({ ok: true, status: orchestrator.status() });
  });

  /** GET /api/orchestrator/status — get current orchestrator status */
  router.get("/status", (_req, res) => {
    if (!orchestrator) {
      res.json({ running: false, initialized: false });
      return;
    }
    res.json(orchestrator.status());
  });

  return router;
}

/** Get the singleton orchestrator instance (for use from index.ts) */
export function getOrchestrator(): Orchestrator | null {
  return orchestrator;
}

/** Set the orchestrator instance (for initialization from index.ts) */
export function setOrchestrator(orch: Orchestrator) {
  orchestrator = orch;
}
