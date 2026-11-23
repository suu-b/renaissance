import { ipcMain, shell, BrowserWindow } from 'electron'
import {
  ensureGitInstalled,
  ensureSqliteInstalled,
  checkGitInstalled,
  checkSqliteInstalled,
  installGit,
  installSqlite,
  loadManifest,
  saveManifest,
} from './services/installer'
import type { InstallationManifest } from './types'
import {
  ensureWorkspaceSetup,
  checkLeftovers,
  checkFolderExists,
  folderExistsInHome,
  checkSetupState,
  completeSetup,
} from './services/workspace'
import { saveUserProfile, loadUserProfile } from './services/profile'

interface IpcContext {
  getMainWindow: () => BrowserWindow | null
  getServerPort: () => number | null
}

export function registerIpcHandlers({ getMainWindow, getServerPort }: IpcContext): void {
  // ----------------------------------------------------
  // 1. Window Controls
  // ----------------------------------------------------
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('minimize-window', () => {
    getMainWindow()?.minimize()
  })

  ipcMain.on('maximize-window', () => {
    getMainWindow()?.maximize()
  })

  ipcMain.on('toggle-maximize-window', () => {
    const window = getMainWindow()
    if (!window) return
    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  })

  ipcMain.on('close-window', () => {
    getMainWindow()?.close()
  })

  ipcMain.on('open-external', (_event, url: string) => {
    shell.openExternal(url)
  })

  // ----------------------------------------------------
  // 2. Server
  // ----------------------------------------------------
  ipcMain.handle('get-port', () => {
    return getServerPort()
  })

  // ----------------------------------------------------
  // 3. Binary & Tool Installation
  // ----------------------------------------------------
  ipcMain.handle('check-git-installed', async () => {
    return await checkGitInstalled()
  })

  ipcMain.handle('check-sqlite-installed', async () => {
    return await checkSqliteInstalled()
  })

  ipcMain.handle('install-git', async () => {
    return await installGit()
  })

  ipcMain.handle('install-sqlite', async () => {
    return await installSqlite()
  })

  ipcMain.handle('ensure-git-installed', async () => {
    const manifest = await loadManifest()
    return await ensureGitInstalled(manifest)
  })

  ipcMain.handle('ensure-sqlite-installed', async () => {
    const manifest = await loadManifest()
    return await ensureSqliteInstalled(manifest)
  })

  ipcMain.handle('load-manifest', async () => {
    return await loadManifest()
  })

  ipcMain.handle('save-manifest', async (_, manifest: InstallationManifest) => {
    await saveManifest(manifest)
    return { success: true }
  })

  // ----------------------------------------------------
  // 4. Workspace & First-Time Setup
  // ----------------------------------------------------
  ipcMain.handle('folder-exists', (_, folderName: string) => {
    return folderExistsInHome(folderName)
  })

  ipcMain.handle('check-folder-exists', (_, folderPath: string) => {
    return checkFolderExists(folderPath)
  })

  ipcMain.handle('check-leftovers', async () => {
    return await checkLeftovers()
  })

  ipcMain.handle('check-setup-state', async () => {
    return await checkSetupState()
  })

  ipcMain.handle('do-setup', async (_, withAccount: boolean) => {
    try {
      const result = await ensureWorkspaceSetup(withAccount)
      return { success: true, ...result }
    } catch (error) {
      console.error('Setup failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  ipcMain.handle('complete-setup', async (_, withAccount: boolean) => {
    return await completeSetup(withAccount)
  })

  // ----------------------------------------------------
  // 5. User Profile
  // ----------------------------------------------------
  ipcMain.handle('save-user-profile', (_, profile: object) => {
    return saveUserProfile(profile)
  })

  ipcMain.handle('load-user-profile', () => {
    return loadUserProfile()
  })
}
