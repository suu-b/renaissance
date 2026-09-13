import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

let mainWindow: BrowserWindow | null = null

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: "Renaissance",
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.setName("Renaissance")

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('maximize-window', () => {
    mainWindow?.maximize()
  })
  ipcMain.on('minimize-window', () => {
    mainWindow?.minimize()
  })
  ipcMain.on('close-window', () => {
    mainWindow?.close()
  })
  ipcMain.on('toggle-maximize-window', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })
  ipcMain.on('open-external', (_event, url: string) => {
    shell.openExternal(url)
  })

  // OAuth handler using embedded browser window
  ipcMain.on('start-oauth', (_event, url: string) => {
    console.log('Starting OAuth flow with embedded window URL:', url)

    const authWindow = new BrowserWindow({
      width: 600,
      height: 700,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    })

    authWindow.once('ready-to-show', () => {
      authWindow.show()
    })

    authWindow.loadURL(url)

    const handleNavigation = async (_event: Electron.Event, url: string) => {
      console.log('OAuth window redirect/navigate:', url)
      if (url.startsWith('renaissance://auth/callback')) {
        _event.preventDefault()
        authWindow.close()

        // Send callback to local server for token handling
        try {
          console.debug("Trying to call the local server now");
          const portFilePath = path.join(os.homedir(), '.renaissance', 'server-port.txt')
          console.debug("Port file to read:", portFilePath);
          if (fs.existsSync(portFilePath)) {
            console.debug("Port file path is there")
            const port = parseInt(fs.readFileSync(portFilePath, 'utf-8').trim())
            if (!isNaN(port)) {
              console.debug("I found the port:", port)
              const localServerUrl = `http://127.0.0.1:${port}/api/v1/user/auth/oauth/callback`
              console.debug("Local server URL:", localServerUrl);

              // Use dynamic import for node-fetch (needed for older Node versions)
              const { default: fetch } = await import('node-fetch')

              const response = await fetch(localServerUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ callbackUrl: url }),
              })
              console.debug("Response:", response);
              if (response.ok) {
                console.debug("Response is ok");
                const data = await response.json()
                console.debug('OAuth callback sent to local server successfully:', data)
                mainWindow?.webContents.send('oauth-callback', data)
              } else {
                console.error('Local server returned error for OAuth callback')
                mainWindow?.webContents.send('oauth-callback', { success: false }) // Send for error handling
              }
            }
          } else {
            console.error('Local server port file not found')
            mainWindow?.webContents.send('oauth-callback', { success: false }) // Send for error handling
          }
        } catch (error) {
          console.error('Failed to send OAuth callback to local server:', error)
          mainWindow?.webContents.send('oauth-callback', { success: false }) // Send for error handling
        }
      }
    }
    authWindow.webContents.on('will-navigate', handleNavigation)
    authWindow.on('closed', () => {
      console.log('OAuth window closed')
    })
  })

  ipcMain.handle('folder-exists', (_, folderName) => {
    const folderPath = path.join(os.homedir(), folderName)
    return fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()
  })

  // Check if git is installed
  ipcMain.handle('check-git-installed', async () => {
    try {
      await execAsync('git --version', { timeout: 5000 })
      return true
    } catch (error) {
      console.error('Git not found:', error)
      return false
    }
  })

  // Check if a specific folder exists
  ipcMain.handle('check-folder-exists', (_, folderPath: string) => {
    try {
      return fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()
    } catch (error) {
      console.error('Error checking folder:', error)
      return false
    }
  })

  // Check for leftovers: renaissance folder with workspace or workspace-temp inside
  ipcMain.handle('check-leftovers', async () => {
    try {
      const renaissancePath = path.join(os.homedir(), 'renaissance')
      const workspacePath = path.join(renaissancePath, 'workspace')
      const workspaceTempPath = path.join(renaissancePath, 'workspace-temp')

      const hasRenaissance = fs.existsSync(renaissancePath) && fs.statSync(renaissancePath).isDirectory()
      const hasWorkspace = fs.existsSync(workspacePath) && fs.statSync(workspacePath).isDirectory()
      const hasWorkspaceTemp = fs.existsSync(workspaceTempPath) && fs.statSync(workspaceTempPath).isDirectory()

      return hasRenaissance && (hasWorkspace || hasWorkspaceTemp)
    } catch (error) {
      console.error('Error checking leftovers:', error)
      return false
    }
  })

  // Do setup: create renaissance folder and git init
  ipcMain.handle('do-setup', async (_, withAccount: boolean) => {
    try {
      const renaissancePath = path.join(os.homedir(), 'renaissance')
      const workspaceName = withAccount ? 'workspace' : 'workspace-temp'
      const workspacePath = path.join(renaissancePath, workspaceName)

      // Create renaissance folder if it doesn't exist
      if (!fs.existsSync(renaissancePath)) {
        fs.mkdirSync(renaissancePath, { recursive: true })
        console.log('Created renaissance folder:', renaissancePath)
      }

      // Create workspace folder
      if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true })
        console.log('Created workspace folder:', workspacePath)
      }

      // Initialize git repository in workspace(-temp) folder
      await execAsync('git init', { cwd: workspacePath, timeout: 10000 })
      console.log('Git initialized in:', workspacePath)

      const indexFilePath = path.join(workspacePath, 'index.csv')
      const headers = ["id", "name", "description", "isPrivate", "createdAt", "updatedAt", "owner", "contributers"];
      if (!fs.existsSync(indexFilePath)) {
        fs.writeFileSync(indexFilePath, headers.join(',') + "\n")
      }

      console.log('Created index file at:', indexFilePath);

      return { success: true, workspacePath, indexFilePath }
    } catch (error) {
      console.error('Setup failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Save user profile to ~/.renaissance/user.json
  ipcMain.handle('save-user-profile', (_, profile: object) => {
    try {
      const renaissanceDir = path.join(os.homedir(), '.renaissance')
      if (!fs.existsSync(renaissanceDir)) {
        fs.mkdirSync(renaissanceDir, { recursive: true })
      }
      const userFilePath = path.join(renaissanceDir, 'user.json')
      fs.writeFileSync(userFilePath, JSON.stringify(profile, null, 2), 'utf-8')
      console.log('User profile saved to:', userFilePath)
      return { success: true }
    } catch (error) {
      console.error('Failed to save user profile:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Load user profile from ~/.renaissance/user.json
  ipcMain.handle('load-user-profile', () => {
    try {
      const userFilePath = path.join(os.homedir(), '.renaissance', 'user.json')
      if (!fs.existsSync(userFilePath)) {
        return { success: false, error: 'No profile found' }
      }
      const raw = fs.readFileSync(userFilePath, 'utf-8')
      const profile = JSON.parse(raw)
      return { success: true, profile }
    } catch (error) {
      console.error('Failed to load user profile:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
