import { ElectronAPI } from '@electron-toolkit/preload'

interface InstallationManifest {
  gitVersion?: string;
  gitPath?: string;
  sqliteVersion?: string;
  sqlitePath?: string;
  installedAt : string,
  platform: string;
}

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
      checkSqliteInstalled: () => Promise<boolean>
      checkFolderExists: (folderPath: string) => Promise<boolean>
      checkLeftovers: () => Promise<boolean>
      doSetup: (withAccount: boolean) => Promise<{ success: boolean; error?: string; workspacePath?: string}>
      saveUserProfile: (profile: object) => Promise<{ success: boolean; error?: string }>
      loadUserProfile: () => Promise<{ success: boolean; profile?: object; error?: string }>
      getServerPort: () => Promise<number>
      loadManifest: () => Promise<InstallationManifest | null>
      saveManifest: (manifest: InstallationManifest) => Promise<{ success: boolean }>
      ensureGitInstalled: () => Promise<string>
      ensureSqliteInstalled: () => Promise<string>
      completeSetup: (withAccount: boolean) => Promise<{ success: boolean; error?: string; gitPath?: string; sqlitePath?: string; workspacePath?: string; }>
      checkSetupState: () => Promise<{ hasManifest: boolean; hasWorkspace: boolean; gitInstalled: boolean; sqliteInstalled: boolean; setupComplete: boolean }>
    }
  }
}
