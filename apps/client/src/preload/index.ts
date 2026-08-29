import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const api = {
  getServerPort: (): number | null => {
    try {
      const portFilePath = join(homedir(), '.renaissance', 'server-port.txt');
      if(existsSync(portFilePath)) {
        const port = parseInt(readFileSync(portFilePath, 'utf-8').trim());
        return isNaN(port) ? null : port;
      }
      return null;
    }
    catch(error) {
      console.error("Failed to read server port:", error);
      return null;
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', {
      ...api,
      maximizeWindow: () => ipcRenderer.send("maximize-window"),
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = {
    ...api,
    maximizeWindow: () => ipcRenderer.send("maximize-window"),
  }
}
