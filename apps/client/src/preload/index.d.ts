import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getServerPort: () => number | null
      maximizeWindow: () => void
    }
  }
}
