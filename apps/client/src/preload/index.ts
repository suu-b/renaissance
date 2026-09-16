import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', {
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
      checkSqliteInstalled: (): Promise<boolean> => ipcRenderer.invoke('check-sqlite-installed'),
      checkGitInstalled: (): Promise<boolean> => ipcRenderer.invoke('check-git-installed'),
      checkFolderExists: (folderPath: string): Promise<boolean> => ipcRenderer.invoke('check-folder-exists', folderPath),
      checkLeftovers: (): Promise<boolean> => ipcRenderer.invoke('check-leftovers'),
      doSetup: (withAccount: boolean): Promise<{ success: boolean; error?: string; workspacePath?: string }> => ipcRenderer.invoke('do-setup', withAccount),
      saveUserProfile: (profile: object): Promise<{ success: boolean; error?: string }> => ipcRenderer.invoke('save-user-profile', profile),
      loadUserProfile: (): Promise<{ success: boolean; profile?: object; error?: string }> => ipcRenderer.invoke('load-user-profile'),
      getServerPort: (): Promise<number> => ipcRenderer.invoke('get-port')
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = {
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
    checkSqliteInstalled: (): Promise<boolean> => ipcRenderer.invoke('check-sqlite-installed'),
    checkGitInstalled: (): Promise<boolean> => ipcRenderer.invoke('check-git-installed'),
    checkFolderExists: (folderPath: string): Promise<boolean> => ipcRenderer.invoke('check-folder-exists', folderPath),
    checkLeftovers: (): Promise<boolean> => ipcRenderer.invoke('check-leftovers'),
    doSetup: (withAccount: boolean): Promise<{ success: boolean; error?: string; workspacePath?: string }> => ipcRenderer.invoke('do-setup', withAccount),
    saveUserProfile: (profile: object): Promise<{ success: boolean; error?: string }> => ipcRenderer.invoke('save-user-profile', profile),
    loadUserProfile: (): Promise<{ success: boolean; profile?: object; error?: string }> => ipcRenderer.invoke('load-user-profile'),
    getServerPort: (): Promise<number> => ipcRenderer.invoke('get-port')
  }
}
