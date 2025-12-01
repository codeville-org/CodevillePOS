import { contextBridge, ipcRenderer } from "electron";

export interface LoadingAPI {
  onLoadingUpdate: (callback: (state: LoadingState) => void) => () => void;
  startInitialization: () => void;
  cleanup: () => void;
}

export interface LoadingState {
  step: string;
  progress: number;
  details?: string;
}

const loadingAPI: LoadingAPI = {
  onLoadingUpdate: (callback) => {
    const handler = (_: any, state: LoadingState) => callback(state);
    ipcRenderer.on("loading:update", handler);
    return () => ipcRenderer.removeListener("loading:update", handler);
  },

  startInitialization: () => {
    ipcRenderer.send("loading:start-initialization");
  },

  cleanup: () => {
    ipcRenderer.removeAllListeners("loading:update");
  }
};

contextBridge.exposeInMainWorld("loadingAPI", loadingAPI);

declare global {
  interface Window {
    loadingAPI: LoadingAPI;
  }
}
