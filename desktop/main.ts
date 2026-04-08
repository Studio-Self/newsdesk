import { app, BrowserWindow, shell, Menu, dialog } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ServerHandle } from "@newsdesk/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;
let serverHandle: ServerHandle | null = null;

// ── Paths ──────────────────────────────────────────────────────────────────
function getDataDir(): string {
  return path.join(app.getPath("userData"), "postgres-data");
}

function getUiDistPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "ui-dist");
  }
  // Development — use the built UI from the workspace
  return path.resolve(__dirname, "../ui/dist");
}

// ── Server ─────────────────────────────────────────────────────────────────
async function boot(): Promise<ServerHandle> {
  const { startServer } = await import("@newsdesk/server");

  return startServer({
    dataDir: getDataDir(),
    port: 3100,
    pgPort: 5434, // Avoid conflict with web dev instance (5433)
    uiMode: "static",
    uiDistPath: getUiDistPath(),
  });
}

// ── Window ─────────────────────────────────────────────────────────────────
function createWindow(port: number) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: "#09090b", // zinc-950 — matches the UI dark background
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadURL(`http://localhost:${port}`);

  // Show window once the page has painted to avoid white flash
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // Open external links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ── macOS Menu ─────────────────────────────────────────────────────────────
function buildMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { type: "separator" },
        { role: "front" },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── App lifecycle ──────────────────────────────────────────────────────────
app.setName("Newsdesk");

app.whenReady().then(async () => {
  buildMenu();

  try {
    serverHandle = await boot();
    createWindow(serverHandle.port);
  } catch (err) {
    console.error("Failed to start Newsdesk server:", err);
    dialog.showErrorBox(
      "Startup Error",
      `Newsdesk failed to start the embedded server.\n\n${err instanceof Error ? err.message : String(err)}`,
    );
    app.quit();
    return;
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && serverHandle) {
      createWindow(serverHandle.port);
    }
  });
});

// macOS: keep running when all windows close
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async (event) => {
  if (serverHandle) {
    event.preventDefault();
    const handle = serverHandle;
    serverHandle = null; // Prevent re-entry
    await handle.shutdown();
    app.quit();
  }
});
