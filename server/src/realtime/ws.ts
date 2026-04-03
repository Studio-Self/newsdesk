import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";
import { subscribeNewsroomEvents } from "../services/live-events.js";
import { logger } from "../middleware/logger.js";

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const newsroomId = url.searchParams.get("newsroomId");

    if (!newsroomId) {
      ws.close(1008, "newsroomId query param required");
      return;
    }

    logger.info({ newsroomId }, "WebSocket client connected");

    const unsubscribe = subscribeNewsroomEvents(newsroomId, (event) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(event));
      }
    });

    ws.on("close", () => {
      unsubscribe();
      logger.info({ newsroomId }, "WebSocket client disconnected");
    });

    ws.on("error", (err) => {
      logger.error({ err }, "WebSocket error");
      unsubscribe();
    });
  });

  return wss;
}
