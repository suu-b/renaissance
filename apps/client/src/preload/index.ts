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
      minimizeWindow: () => ipcRenderer.send("minimize-window"),
      closeWindow: () => ipcRenderer.send("close-window"),
      toggleMaximizeWindow: () => ipcRenderer.send("toggle-maximize-window"),
      openExternal: (url: string) => ipcRenderer.send("open-external", url),
      startOAuth: (url: string) => ipcRenderer.send("start-oauth", url),

      onOAuthCallback: (callback: (result: any) => void) => {
        ipcRenderer.on('oauth-callback', (event, result) => callback(result))
      },

      removeOAuthCallback: () => {
       ipcRenderer.removeAllListeners('oauth-callback')
      },

      folderExists: (folderName: string): Promise<boolean> => ipcRenderer.invoke('folder-exists', folderName),
      checkGitInstalled: (): Promise<boolean> => ipcRenderer.invoke('check-git-installed'),
      checkFolderExists: (folderPath: string): Promise<boolean> => ipcRenderer.invoke('check-folder-exists', folderPath),
      doSetup: (): Promise<{ success: boolean; error?: string }> => ipcRenderer.invoke('do-setup')
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
    minimizeWindow: () => ipcRenderer.send("minimize-window"),
    closeWindow: () => ipcRenderer.send("close-window"),
    toggleMaximizeWindow: () => ipcRenderer.send("toggle-maximize-window"),
    openExternal: (url: string) => ipcRenderer.send("open-external", url),
    startOAuth: (url: string) => ipcRenderer.send("start-oauth", url),
    onOAuthCallback: (callback: (url: string) => void) => {
      ipcRenderer.on('oauth-callback', (event, url) => callback(url))
    },
    removeOAuthCallback: () => {
      ipcRenderer.removeAllListeners('oauth-callback')
    },
    folderExists: (folderName: string): Promise<boolean> => ipcRenderer.invoke('folder-exists', folderName),
    checkGitInstalled: (): Promise<boolean> => ipcRenderer.invoke('check-git-installed'),
    checkFolderExists: (folderPath: string): Promise<boolean> => ipcRenderer.invoke('check-folder-exists', folderPath),
    doSetup: (): Promise<{ success: boolean; error?: string }> => ipcRenderer.invoke('do-setup')
  }
}
