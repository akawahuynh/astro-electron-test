/// <reference path="../.astro/types.d.ts" />
interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import("electron").IpcRenderer;
}
