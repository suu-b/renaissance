import { app, shell, BrowserWindow } from 'electron'
import { spawn } from 'node:child_process'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'node:fs'
import path from 'node:path'
import { RENAISSANCE_INSTALL_PATH, RENAISSANCE_RUNTIME_PATH } from './config'
import { registerIpcHandlers } from './ipc'


if (!fs.existsSync(RENAISSANCE_RUNTIME_PATH)) {
  fs.mkdirSync(RENAISSANCE_RUNTIME_PATH, { recursive: true })
}

let mainWindow: BrowserWindow | null = null
let serverPort: number | null = null

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

async function startServer() {
  const { default: getPort } = await import('get-port')
  serverPort = await getPort()

  const isDev = !app.isPackaged
  console.log('ISDEV:', isDev)
  if (isDev) {
    spawn('pnpm', ['--filter', '@renaissance/server', 'dev'], {
      env: {
        ...process.env,
        PORT: String(serverPort),
        RENAISSANCE_INSTALL_PATH,
        RENAISSANCE_RUNTIME_PATH,
        
      },
      stdio: 'inherit',
    })
  } else {
    const bundleJs = path.join(process.resourcesPath, 'server-bin', 'index.cjs')

    if (!fs.existsSync(bundleJs)) {
      console.error(`Server bundle not found at: ${bundleJs}`)
      console.error('Falling back to development mode')
      spawn('pnpm', ['--filter', '@renaissance/server', 'dev'], {
        env: {
          ...process.env,
          PORT: String(serverPort),
          RENAISSANCE_INSTALL_PATH,
          RENAISSANCE_RUNTIME_PATH,
        },
        stdio: 'inherit',
      })
    } else {
      spawn(process.execPath, ['--no-warnings', bundleJs], {
        env: {
          ...process.env,
          PORT: String(serverPort),
          RENAISSANCE_INSTALL_PATH,
          RENAISSANCE_RUNTIME_PATH,
          ELECTRON_RUN_AS_NODE: '1',
        },
        stdio: 'inherit',
      })
    }
  }

  return serverPort
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Renaissance',
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.webContents.openDevTools()

  // HMR for renderer based on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.setName('Renaissance')

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Spawn the local fastify server
  startServer()

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Register all IPC handlers
  registerIpcHandlers({
    getMainWindow: () => mainWindow,
    getServerPort: () => serverPort,
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
