import { app, shell, BrowserWindow, ipcMain, protocol } from 'electron'
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
  app.on('second-instance', (_event, commandLine) => {
    console.log('second-instance event received:', commandLine)
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    const url = commandLine.find((arg) => arg.startsWith('renaissance://'))
    if (url && url.startsWith('renaissance://auth/callback')) {
      console.log('Sending oauth-callback to renderer:', url)
      mainWindow?.webContents.send('oauth-callback', url)
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
    const initialUrl = process.argv.find((arg) => arg.startsWith('renaissance://'))
    if (initialUrl && initialUrl.startsWith('renaissance://auth/callback')) {
      console.log('Sending initial oauth-callback to renderer:', initialUrl)
      mainWindow?.webContents.send('oauth-callback', initialUrl)
    }
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

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('renaissance', process.execPath, [join(__dirname, '../main/index.js')])
  }
} else {
  app.setAsDefaultProtocolClient('renaissance')
}

// a custom protocol for oatuh callback
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'renaissance',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
    },
  },
])

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
  ipcMain.on('open-external', (event, url: string) => {
    shell.openExternal(url)
  })

  // OAuth handler using embedded browser window
  ipcMain.on('start-oauth', (event, url: string) => {
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

    const handleNavigation = (_event: Electron.Event, url: string) => {
      console.log('OAuth window redirect/navigate:', url)
      if (url.startsWith('renaissance://auth/callback')) {
        _event.preventDefault()
        authWindow.close()
        console.log('Sending oauth-callback to renderer:', url)
        mainWindow?.webContents.send('oauth-callback', url)
      }
    }

    authWindow.webContents.on('will-redirect', handleNavigation)
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

  // Do setup: create renaissance folder and git init
  ipcMain.handle('do-setup', async () => {
    try {
      const renaissancePath = path.join(os.homedir(), 'renaissance')
      
      // Create renaissance folder if it doesn't exist
      if (!fs.existsSync(renaissancePath)) {
        fs.mkdirSync(renaissancePath, { recursive: true })
        console.log('Created renaissance folder:', renaissancePath)
      }
      
      // Initialize git repository
      await execAsync('git init', { cwd: renaissancePath, timeout: 10000 })
      console.log('Git initialized in:', renaissancePath)
      
      return { success: true }
    } catch (error) {
      console.error('Setup failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // handle oauth callback from custom protocol
  app.on('open-url', (_event, url) => {
    console.log('open-url event received:', url)
    _event.preventDefault()
    if (url.startsWith('renaissance://auth/callback')) {
      console.log('Sending oauth-callback to renderer:', url)
      mainWindow?.webContents.send('oauth-callback', url)
    }
  })

  // For Windows/Linux, handle protocol activation
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('second-instance event received:', commandLine)
    const url = commandLine.find(arg => arg.startsWith('renaissance://'))
    if (url && url.startsWith('renaissance://auth/callback')) {
      console.log('Sending oauth-callback to renderer:', url)
      mainWindow?.webContents.send('oauth-callback', url)
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
