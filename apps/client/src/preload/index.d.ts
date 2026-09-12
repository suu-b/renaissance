import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getServerPort: () => number | null
      maximizeWindow: () => void
      minimizeWindow: () => void
      closeWindow: () => void
      toggleMaximizeWindow: () => void
      openExternal: (url: string) => void
      startOAuth: (url: string) => void
      onOAuthCallback: (callback: (result: any) => void) => void
      removeOAuthCallback: () => void
      folderExists: (folderName: string) => Promise<boolean>
      checkGitInstalled: () => Promise<boolean>
      checkFolderExists: (folderPath: string) => Promise<boolean>
      doSetup: () => Promise<{ success: boolean; error?: string }>
    }
  }
}
