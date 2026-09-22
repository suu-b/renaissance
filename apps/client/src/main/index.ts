import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { spawn } from 'node:child_process'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import extract from "extract-zip";

const execAsync = promisify(exec)

const GIT_VERSION = "2.53.0"
const SQLITE_VERSION = "3.50.4"



interface InstallationManifest {
  gitVersion?: string;
  gitPath?: string;
  sqliteVersion?: string;
  sqlitePath?: string;
  installedAt: string,
  platform: string;
}

// directory paths
const installDir: string = path.join(path.dirname(app.getPath("exe")), "renaissance");

const runtimeDir: string = path.join(installDir, "runtime");
console.log('Install directory:', installDir);
console.log('Runtime directory:', runtimeDir);
if (!fs.existsSync(runtimeDir)) {
  fs.mkdirSync(runtimeDir, { recursive: true });
  console.log('Created runtime directory:', runtimeDir);
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

  if (isDev) {
    spawn('pnpm', ['--filter', '@renaissance/server', 'dev'], {
      env: {
        ...process.env,
        PORT: String(serverPort),
        RENAISSANCE_INSTALL_PATH: installDir,
        RENAISSANCE_RUNTIME_PATH: runtimeDir,
      },
      stdio: 'inherit'
    })
  } else {
    const bundleJs = path.join(process.resourcesPath, 'server-bin', 'index.js')

    if (!fs.existsSync(bundleJs)) {
      console.error(`Server bundle not found at: ${bundleJs}`)
      console.error('Falling back to development mode')
      spawn('pnpm', ['--filter', '@renaissance/server', 'dev'], {
        env: {
          ...process.env,
          PORT: String(serverPort),
          RENAISSANCE_INSTALL_PATH: installDir,
          RENAISSANCE_RUNTIME_PATH: runtimeDir,
        },
        stdio: 'inherit'
      })
    } else {
      spawn(process.execPath, ['--no-warnings', bundleJs], {
        env: {
          ...process.env,
          PORT: String(serverPort),
          RENAISSANCE_INSTALL_PATH: installDir,
          RENAISSANCE_RUNTIME_PATH: runtimeDir,
          ELECTRON_RUN_AS_NODE: '1',
        },
        stdio: 'inherit'
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
          console.debug('Trying to call the local server now')
          const portFilePath = path.join(os.homedir(), '.renaissance', 'server-port.txt')
          console.debug('Port file to read:', portFilePath)
          if (fs.existsSync(portFilePath)) {
            console.debug('Port file path is there')
            const port = parseInt(fs.readFileSync(portFilePath, 'utf-8').trim())
            if (!isNaN(port)) {
              console.debug('I found the port:', port)
              const localServerUrl = `http://127.0.0.1:${port}/api/v1/user/auth/oauth/callback`
              console.debug('Local server URL:', localServerUrl)

              // Use dynamic import for node-fetch (needed for older Node versions)
              const { default: fetch } = await import('node-fetch')

              const response = await fetch(localServerUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ callbackUrl: url })
              })
              console.debug('Response:', response)
              if (response.ok) {
                console.debug('Response is ok')
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

  ipcMain.handle('check-sqlite-installed', async () => {
    try {
      await execAsync('sqlite3 --version', { timeout: 5000 })
      return true
    } catch (error) {
      console.error('Git not found:', error)
      return false
    }
  })

  async function loadManifest(): Promise<InstallationManifest | null> {
    try {
      const manifestPath = path.join(runtimeDir, 'manifest.json');
      console.log('Loading manifest from:', manifestPath);
      if (!fs.existsSync(manifestPath)) {
        console.log('Manifest file does not exist');
        return null;
      }
      const content = fs.readFileSync(manifestPath, 'utf-8');
      const manifest = JSON.parse(content);
      console.log('Loaded manifest:', manifest);
      return manifest;
    } catch (error) {
      console.error('Failed to load manifest:', error);
      return null;
    }
  }

  async function saveManifest(manifest: InstallationManifest): Promise<void> {
    try {
      const manifestPath = path.join(runtimeDir, 'manifest.json');
      console.log('Saving manifest to:', manifestPath);
      console.log('Manifest content:', manifest);
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log('Manifest saved successfully');
    } catch (error) {
      console.error('Failed to save manifest:', error);
      throw error;
    }
  }

  async function ensureGitInstalled(manifest: InstallationManifest | null): Promise<string> {
    console.log('Ensuring git installation...');
    console.log('Current manifest:', manifest);

    // Check if manifest has valid git installation
    if (manifest?.gitPath && manifest.gitVersion === GIT_VERSION) {
      const gitPath = manifest.gitPath;
      console.log('Checking existing git path from manifest:', gitPath);
      if (fs.existsSync(gitPath)) {
        // Verify it works
        try {
          await execAsync(`"${gitPath}" --version`, { timeout: 5000 });
          console.log('Git already installed and working at:', gitPath);
          return gitPath;
        } catch {
          console.log('Git path exists but invalid, reinstalling');
        }
      } else {
        console.log('Git path from manifest does not exist:', gitPath);
      }
    }

    console.log('Installing git...');
    // Install git
    const platform = process.platform;
    let result: string | false = false;

    if (platform.startsWith("win")) {
      result = await installWinGit();
    } else if (platform.startsWith("linux")) {
      result = await installLinGit();
    } else {
      throw new Error("Unsupported platform", { cause: platform });
    }

    if (!result) throw new Error("Git failed to install");
    console.log('Git installed successfully at:', result);
    return result;
  }

  async function ensureSqliteInstalled(manifest: InstallationManifest | null): Promise<string> {
    console.log('Ensuring sqlite installation...');
    console.log('Current manifest:', manifest);

    // Check if manifest has valid sqlite installation
    if (manifest?.sqlitePath && manifest.sqliteVersion === SQLITE_VERSION) {
      const sqlitePath = manifest.sqlitePath;
      console.log('Checking existing sqlite path from manifest:', sqlitePath);
      if (fs.existsSync(sqlitePath)) {
        // Verify it works
        try {
          await execAsync(`"${sqlitePath}" --version`, { timeout: 5000 });
          console.log('SQLite already installed and working at:', sqlitePath);
          return sqlitePath;
        } catch {
          console.log('SQLite path exists but invalid, reinstalling');
        }
      } else {
        console.log('SQLite path from manifest does not exist:', sqlitePath);
      }
    }

    console.log('Installing sqlite...');
    // Install sqlite
    const platform = process.platform;
    let result: string | false = false;

    if (platform.startsWith("win")) {
      result = await installWinSqlite();
    } else if (platform.startsWith("linux")) {
      result = await installLinSqlite();
    } else {
      throw new Error("Unsupported platform", { cause: platform });
    }

    if (!result) throw new Error("SQLite failed to install");
    console.log('SQLite installed successfully at:', result);
    return result;
  }

  async function installWinGit(): Promise<string | false> {
    try {
      console.log('Installing Git for Windows...');
      const url =
        `https://github.com/git-for-windows/git/releases/download/` +
        `v${GIT_VERSION}.windows.1/MinGit-${GIT_VERSION}-64-bit.zip`;
      const archivePath = path.join(
        os.tmpdir(),
        `Renaissance-MinGit-${GIT_VERSION}.zip`
      );
      console.log('Downloading Git from:', url);
      console.log('Archive path:', archivePath);

      const response = await fetch(url);
      if (!response.ok) {
        console.error(
          `Failed to download Git: ${response.status} ${response.statusText}`
        );
        return false;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(archivePath, buffer);
      console.log('Downloaded Git to:', archivePath);

      console.log('Extracting Git to:', runtimeDir);
      await extract(archivePath, { dir: runtimeDir });
      fs.rmSync(archivePath);
      console.log('Cleaned up archive');

      const gitPath = path.join(runtimeDir, 'git.exe');
      console.log('Git installation path:', gitPath);
      return gitPath;
    } catch (error) {
      console.error('Failed to install Git for Windows:', error);
      return false;
    }
  }

  async function installLinGit(): Promise<string | false> {
    try {
      console.log('Installing Git for Linux...');
      const url = `https://github.com/baulk/git-minimal/releases/download/v${GIT_VERSION}/git-minimal-musl-v${GIT_VERSION}-linux-amd64.tar.xz`;
      const archivePath = path.join(
        os.tmpdir(),
        `Renaissance-git-${GIT_VERSION}.tar.xz`
      );
      console.log('Downloading Git from:', url);
      console.log('Archive path:', archivePath);

      const response = await fetch(url);
      if (!response.ok) {
        console.error(
          `Failed to download Git: ${response.status} ${response.statusText}`
        );
        return false;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(archivePath, buffer);
      console.log('Downloaded Git to:', archivePath);

      // Extract tar.xz using system tar
      console.log('Extracting Git to:', runtimeDir);
      await execAsync(`tar -xf ${archivePath} -C ${runtimeDir}`, { timeout: 120000 });
      console.log('Extraction complete');

      // Cleanup
      fs.rmSync(archivePath);
      console.log('Cleaned up archive');

      // Return the path to git executable (git-minimal extracts to versioned directory)
      const gitPath = path.join(runtimeDir, `git-minimal-musl-v${GIT_VERSION}-linux-amd64`, 'bin', 'git');
      console.log('Git installation path:', gitPath);
      return gitPath;
    } catch (error) {
      console.error('Failed to install Git for Linux:', error);
      return false;
    }
  }

  ipcMain.handle('install-git', async () => {
    const platform = process.platform;
    let result: string | false = false;

    if (platform.startsWith("win")) {
      result = await installWinGit()
    }
    else if (platform.startsWith("linux")) {
      result = await installLinGit()
    } else {
      throw new Error("Unsupported platform", { cause: platform });
    }

    if (!result) throw new Error("Git failed to install");
    return result;
  })

  async function installWinSqlite(): Promise<string | false> {
    try {
      console.log('Installing SQLite for Windows...');
      // SQLite uses date-based versioning in URLs
      const url = `https://www.sqlite.org/2025/sqlite-tools-win32-x86-3450100.zip`;
      const archivePath = path.join(
        os.tmpdir(),
        `Renaissance-sqlite-tools.zip`
      );
      console.log('Downloading SQLite from:', url);
      console.log('Archive path:', archivePath);

      const response = await fetch(url);
      if (!response.ok) {
        console.error(
          `Failed to download SQLite: ${response.status} ${response.statusText}`
        );
        return false;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(archivePath, buffer);
      console.log('Downloaded SQLite to:', archivePath);

      console.log('Extracting SQLite to:', runtimeDir);
      await extract(archivePath, { dir: runtimeDir });
      fs.rmSync(archivePath);
      console.log('Cleaned up archive');

      const sqlitePath = path.join(runtimeDir, 'sqlite3.exe');
      console.log('SQLite installation path:', sqlitePath);
      return sqlitePath;
    } catch (error) {
      console.error('Failed to install SQLite for Windows:', error);
      return false;
    }
  }

  async function installLinSqlite(): Promise<string | false> {
    try {
      console.log('Installing SQLite for Linux...');
      // e.g. "3.50.1" -> "3500100"
      const versionCode = sqliteVersionCode(SQLITE_VERSION);

      const url =
        `https://www.sqlite.org/2025/` +
        `sqlite-tools-linux-x64-${versionCode}.zip`;

      //     const url =
      // `https://www.sqlite.org/${year}/` +
      // `sqlite-tools-linux-x64-${versionCode}.zip`;

      const archivePath = path.join(
        os.tmpdir(),
        `Renaissance-sqlite-${SQLITE_VERSION}.zip`
      );

      fs.mkdirSync(runtimeDir, { recursive: true });

      console.log("Downloading SQLite:", url);
      console.log("Archive path:", archivePath);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to download SQLite: ${response.status} ${response.statusText}`
        );
      }

      const buffer = Buffer.from(
        await response.arrayBuffer()
      );

      fs.writeFileSync(archivePath, buffer);
      console.log("Downloaded SQLite to:", archivePath);

      console.log("Extracting SQLite to:", runtimeDir);

      // Use the already imported extract function
      await extract(archivePath, { dir: runtimeDir });

      fs.rmSync(archivePath);
      console.log("Cleaned up archive");

      const sqlitePath = path.join(
        runtimeDir,
        "sqlite3"
      );

      // Linux executable permission
      fs.chmodSync(sqlitePath, 0o755);
      console.log("Set executable permissions on:", sqlitePath);

      console.log("SQLite installed at:", sqlitePath);

      return sqlitePath;
    } catch (error) {
      console.error(
        "Failed to install SQLite for Linux:",
        error
      );

      return false;
    }
  }

  function sqliteVersionCode(version: string): string {
    const [major, minor, patch] = version
      .split(".")
      .map(Number);

    return `${major}${minor.toString().padStart(2, "0")}${patch
      .toString()
      .padStart(2, "0")}00`;
  }

  ipcMain.handle('install-sqlite', async () => {
    const platform = process.platform;
    let result: string | false = false;

    if (platform.startsWith("win")) {
      result = await installWinSqlite()
    }
    else if (platform.startsWith("linux")) {
      result = await installLinSqlite()
    } else {
      throw new Error("Unsupported platform", { cause: platform });
    }

    if (!result) throw new Error("SQLite failed to install");
    return result;
  })

  ipcMain.handle('load-manifest', async () => {
    return await loadManifest();
  })

  ipcMain.handle('save-manifest', async (_, manifest: InstallationManifest) => {
    await saveManifest(manifest);
    return { success: true };
  })

  ipcMain.handle('ensure-git-installed', async () => {
    const manifest = await loadManifest();
    const gitPath = await ensureGitInstalled(manifest);
    return gitPath;
  })

  ipcMain.handle('ensure-sqlite-installed', async () => {
    const manifest = await loadManifest();
    const sqlitePath = await ensureSqliteInstalled(manifest);
    return sqlitePath;
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

      const hasRenaissance =
        fs.existsSync(renaissancePath) && fs.statSync(renaissancePath).isDirectory()
      const hasWorkspace = fs.existsSync(workspacePath) && fs.statSync(workspacePath).isDirectory()
      const hasWorkspaceTemp =
        fs.existsSync(workspaceTempPath) && fs.statSync(workspaceTempPath).isDirectory()

      return hasRenaissance && (hasWorkspace || hasWorkspaceTemp)
    } catch (error) {
      console.error('Error checking leftovers:', error)
      return false
    }
  })

  async function ensureWorkspaceSetup(withAccount: boolean) {
    console.log('Ensuring workspace setup withAccount:', withAccount);
    const renaissancePath = path.join(os.homedir(), 'renaissance')
    const workspaceName = withAccount ? 'workspace' : 'workspace-temp'
    const workspacePath = path.join(renaissancePath, workspaceName)
    console.log('Renaissance path:', renaissancePath);
    console.log('Workspace path:', workspacePath);

    // Create folders idempotently
    if (!fs.existsSync(renaissancePath)) {
      fs.mkdirSync(renaissancePath, { recursive: true })
      console.log('Created renaissance folder:', renaissancePath)
    } else {
      console.log('Renaissance folder already exists:', renaissancePath)
    }

    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true })
      console.log('Created workspace folder:', workspacePath)
    } else {
      console.log('Workspace folder already exists:', workspacePath)
    }

    // Initialize git if not already initialized
    const gitDir = path.join(workspacePath, '.git')
    if (!fs.existsSync(gitDir)) {
      console.log('Initializing git in:', workspacePath);
      await execAsync('git init', { cwd: workspacePath, timeout: 10000 })
      console.log('Git initialized in:', workspacePath)
    } else {
      console.log('Git already initialized in:', workspacePath)
    }

    console.log('Workspace setup complete:', { workspacePath });
    return { workspacePath }
  }

  // Do setup: create renaissance folder and git init (idempotent)
  ipcMain.handle('do-setup', async (_, withAccount: boolean) => {
    try {
      const result = await ensureWorkspaceSetup(withAccount)
      return { success: true, ...result }
    } catch (error) {
      console.error('Setup failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Complete setup: install dependencies and setup workspace
  ipcMain.handle('complete-setup', async (_, withAccount: boolean) => {
    try {
      console.log('Starting complete setup withAccount:', withAccount);
      const manifest = await loadManifest();

      console.log('Phase 1: Installing git...');
      const gitPath = await ensureGitInstalled(manifest);
      console.log('Git installation complete:', gitPath);

      console.log('Phase 2: Installing sqlite...');
      const sqlitePath = await ensureSqliteInstalled(manifest);
      console.log('SQLite installation complete:', sqlitePath);

      console.log('Phase 3: Setting up workspace...');
      const workspaceResult = await ensureWorkspaceSetup(withAccount);
      console.log('Workspace setup complete:', workspaceResult);

      console.log('Phase 4: Saving manifest...');
      await saveManifest({
        gitVersion: GIT_VERSION,
        gitPath,
        sqliteVersion: SQLITE_VERSION,
        sqlitePath,
        installedAt: new Date().toISOString(),
        platform: process.platform
      });
      console.log('Manifest saved');

      console.log('Complete setup finished successfully');
      return {
        success: true,
        gitPath,
        sqlitePath,
        ...workspaceResult
      };
    } catch (error) {
      console.error('Complete setup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  })

  // Check setup state
  ipcMain.handle('check-setup-state', async () => {
    try {
      const manifest = await loadManifest();
      const renaissancePath = path.join(os.homedir(), 'renaissance');
      const folderExists = fs.existsSync(renaissancePath);

      return {
        hasManifest: !!manifest,
        hasWorkspace: folderExists,
        gitInstalled: !!manifest?.gitPath,
        sqliteInstalled: !!manifest?.sqlitePath,
        setupComplete: !!manifest && folderExists
      };
    } catch (error) {
      console.error('Error checking setup state:', error);
      return {
        hasManifest: false,
        hasWorkspace: false,
        gitInstalled: false,
        sqliteInstalled: false,
        setupComplete: false
      };
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

  ipcMain.handle('get-port', () => {
    return serverPort
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
