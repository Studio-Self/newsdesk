import express, { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { Db } from "@newsdesk/db";
import { httpLogger, errorHandler } from "./middleware/index.js";
import {
  healthRoutes,
  newsroomRoutes,
  agentRoutes,
  storyRoutes,
  beatRoutes,
  assignmentRoutes,
  approvalRoutes,
  dashboardRoutes,
  costRoutes,
  activityRoutes,
} from "./routes/index.js";

export async function createApp(db: Db, opts: { uiMode: "none" | "static" | "vite-dev"; serverPort: number }) {
  const app = express();

  app.use(express.json({ limit: "5mb" }));
  app.use(httpLogger);

  // Mount API routes
  const api = Router();
  api.use("/health", healthRoutes(db));
  api.use("/newsrooms", newsroomRoutes(db));
  api.use(agentRoutes(db));
  api.use(storyRoutes(db));
  api.use(beatRoutes(db));
  api.use(assignmentRoutes(db));
  api.use(approvalRoutes(db));
  api.use(dashboardRoutes(db));
  api.use(costRoutes(db));
  api.use(activityRoutes(db));
  app.use("/api", api);

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  if (opts.uiMode === "static") {
    const uiDist = path.resolve(__dirname, "../../ui/dist");
    if (fs.existsSync(path.join(uiDist, "index.html"))) {
      const indexHtml = fs.readFileSync(path.join(uiDist, "index.html"), "utf-8");
      app.use(express.static(uiDist));
      app.get(/.*/, (_req, res) => {
        res.status(200).set("Content-Type", "text/html").end(indexHtml);
      });
    }
  }

  if (opts.uiMode === "vite-dev") {
    const uiRoot = path.resolve(__dirname, "../../ui");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: uiRoot,
      appType: "custom",
      server: {
        middlewareMode: true,
        hmr: { port: opts.serverPort + 10000 },
      },
    });

    app.use(vite.middlewares);
    app.get(/.*/, async (req, res, next) => {
      try {
        const templatePath = path.resolve(uiRoot, "index.html");
        const template = fs.readFileSync(templatePath, "utf-8");
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set("Content-Type", "text/html").end(html);
      } catch (err) {
        next(err);
      }
    });
  }

  app.use(errorHandler);

  return app;
}
