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
      checkLeftovers: () => Promise<boolean>
      doSetup: (withAccount: boolean) => Promise<{ success: boolean; error?: string; workspacePath?: string, indexFilePath?: string}>
      saveUserProfile: (profile: object) => Promise<{ success: boolean; error?: string }>
      loadUserProfile: () => Promise<{ success: boolean; profile?: object; error?: string }>
    }
  }
}
