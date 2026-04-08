// Preload script — runs in a sandboxed renderer context.
// Exposes a minimal API to the renderer via contextBridge if needed.
// Currently the UI is a standard web app loaded over localhost,
// so no Electron-specific APIs are exposed.

import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("desktop", {
  platform: process.platform,
  isDesktop: true,
});
