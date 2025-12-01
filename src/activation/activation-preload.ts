import { contextBridge, ipcRenderer } from "electron";

export interface ActivationAPI {
  license: {
    activate: (serialKey: string) => Promise<any>;
    getHardwareId: () => Promise<string>;
  };
  window: {
    close: () => Promise<void>;
    minimize: () => Promise<void>;
  };
}

const activationAPI: ActivationAPI = {
  license: {
    activate: (serialKey: string) =>
      ipcRenderer.invoke("license:activate", serialKey),
    getHardwareId: () => ipcRenderer.invoke("license:getHardwareId")
  },
  window: {
    close: () => ipcRenderer.invoke("window:close"),
    minimize: () => ipcRenderer.invoke("window:minimize")
  }
};

contextBridge.exposeInMainWorld("activationAPI", activationAPI);
