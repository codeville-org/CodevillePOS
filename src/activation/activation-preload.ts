import { contextBridge, ipcRenderer } from "electron";

export interface ActivationAPI {
  license: {
    activate: (serialKey: string) => Promise<any>;
    getHardwareId: () => Promise<string>;
  };
  window: {
    minimize: () => Promise<void>;
    close: () => Promise<void>;
  };
}

const activationAPI: ActivationAPI = {
  license: {
    activate: (serialKey: string) =>
      ipcRenderer.invoke("license:activate", serialKey),
    getHardwareId: () => ipcRenderer.invoke("license:getHardwareId")
  },
  window: {
    minimize: () => ipcRenderer.invoke("licenseWindow:minimize"),
    close: () => ipcRenderer.invoke("licenseWindow:close")
  }
};

contextBridge.exposeInMainWorld("activationAPI", activationAPI);
