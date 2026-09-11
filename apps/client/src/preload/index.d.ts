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
      onOAuthCallback: (callback: (url: string) => void) => void
      removeOAuthCallback: () => void
    }
  }
}
