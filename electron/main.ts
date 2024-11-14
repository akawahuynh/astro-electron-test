// electron/main.ts
import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const RENDERER_ROUTES = path.join(RENDERER_DIST, "routes.json");
const routes = JSON.parse(fs.readFileSync(RENDERER_ROUTES, "utf-8"));
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    const defaultRoute = routes.find((route: any) => route.isIndex);
    if (defaultRoute) {
      win.loadFile(path.join(RENDERER_DIST, "index.html"));
    }
  }
}
ipcMain.on("navigate", (_event, routePath) => {
  const route = routes.find((r: any) => r.route === routePath);
  if (route && route.route) {
    win.loadFile(path.join(RENDERER_DIST, route.route, "index.html"));
  } else {
    throw new Error("Route not found");
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
