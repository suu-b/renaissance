import fs from 'node:fs';
import { execFile, spawn, type ChildProcess } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import os from 'node:os';
import getPort from 'get-port';

import extract from 'extract-zip';

// TODOS:
// - windows 64 bit and x64 for linux support

export class Startup {
  private installPath: string;
  private runtimePath: string;
  private userPath: string;

  private gitVersion: string;
  private sqliteVersion: string;

  private isDevelopment: boolean;
  private isPackaged: boolean;

  constructor(
    installPath: string,
    runtimePath: string,
    userPath: string,
    gitVersion: string,
    sqliteVersion: string,
    isDevelopment: boolean,
    isPackaged: boolean
  ) {
    this.installPath = installPath;
    this.runtimePath = runtimePath;
    this.userPath = userPath;
    this.gitVersion = gitVersion;
    this.sqliteVersion = sqliteVersion;
    this.isDevelopment = isDevelopment;
    this.isPackaged = isPackaged;
  }

  async main() {
    try {
      console.log('Beginning startup...');
      console.log('Beginning Application-level initialization...');

      console.log('Ensuring install and runtime directory...');
      this.ensureInstallAndRuntimePaths();

      console.log('Ensuring Sqlite...');
      await this.ensureSqlite();

      console.log('Ensuring Git...');
      await this.ensureGit();

      console.log('Ensuring Backend runs...');
      const serverPort: number = await this.ensureBackendRuns();

      console.log('Ensuring Base Tables...');
      await this.ensureBaseTables(serverPort);

      console.log('Ensuring user entry...');
      await this.ensureUserEntry();

      console.log('Beginning User-level initialization...');
    } catch (error) {
      console.error('Failed to do the startup:', error);
      throw error;
    }
  }

  private ensureInstallAndRuntimePaths() {
    this.ensureDirectory(this.installPath);
    this.ensureDirectory(this.runtimePath);
  }

  private ensureDirectory(path: string) {
    if (fs.existsSync(path)) {
      if (!fs.statSync(path).isDirectory()) {
        throw new Error(`Path exists but is not a directory: ${path}`);
      }
      console.log('Already exists:', path);
      return;
    }
    fs.mkdirSync(path, { recursive: true });
    console.log('Created. Was missing:', path);
  }

  private async ensureSqlite(): Promise<string> {
    const execAsync = promisify(execFile);
    const isWindows = process.platform === 'win32';
    const sqliteDir = path.join(this.runtimePath, 'sqlite');
    const sqlitePath = path.join(sqliteDir, isWindows ? 'sqlite3.exe' : 'sqlite3');

    try {
      const { stdout } = await execAsync(sqlitePath, ['--version'], { timeout: 5000 });
      const currentVersion = stdout.trim().split(/\s+/)[0];
      if (currentVersion === this.sqliteVersion) {
        console.log('SQLite already installed:', currentVersion);
        return sqlitePath;
      }
      console.warn(`Wrong SQLite version. Expected ${this.sqliteVersion}, found ${currentVersion}`);
    } catch (error) {
      console.warn('SQLite not found or not executable:', error);
    }
    if (fs.existsSync(sqliteDir)) {
      fs.rmSync(sqliteDir, { recursive: true, force: true });
    }
    const [major, minor, patch] = this.sqliteVersion.split('.').map(Number);
    const versionCode = `${major}${minor.toString().padStart(2, '0')}${patch.toString().padStart(2, '0')}00`;
    const url = isWindows
      ? `https://www.sqlite.org/2025/sqlite-tools-win32-x86-${versionCode}.zip`
      : `https://www.sqlite.org/2025/sqlite-tools-linux-x64-${versionCode}.zip`;
    const archivePath = path.join(os.tmpdir(), `Renaissance-sqlite-${this.sqliteVersion}.zip`);
    const stagingDir = path.join(this.runtimePath, '.staging');
    console.log('Downloading SQLite from:', url);
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(60000)
      });
      if (!response.ok) {
        throw new Error(`Failed to download SQLite: ${response.status} ${response.statusText}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(archivePath, buffer);
      console.log('Downloaded SQLite to:', archivePath);
      console.log('Extracting SQLite to staging:', stagingDir);
      if (fs.existsSync(stagingDir)) {
        fs.rmSync(stagingDir, { recursive: true, force: true });
      }
      fs.mkdirSync(stagingDir, { recursive: true });
      await extract(archivePath, { dir: stagingDir });
      console.log('SQLite extracted to staging successfully');
      console.log('Moving SQLite from staging to:', sqliteDir);
      if (isWindows) {
        fs.renameSync(path.join(stagingDir, 'sqlite3.exe'), sqlitePath);
      } else {
        fs.renameSync(path.join(stagingDir, 'sqlite3'), sqlitePath);
      }
      console.log('SQLite moved successfully');
    } catch (error) {
      console.error('SQLite download/extraction failed:', error);
      throw error;
    } finally {
      if (fs.existsSync(archivePath)) {
        fs.rmSync(archivePath, { force: true });
        console.log('Cleaned up archive');
      }
      if (fs.existsSync(stagingDir)) {
        fs.rmSync(stagingDir, { recursive: true, force: true });
        console.log('Cleaned up staging directory');
      }
    }
    if (!fs.existsSync(sqlitePath)) {
      throw new Error(`SQLite executable not found after extraction: ${sqlitePath}`);
    }
    if (!isWindows) {
      fs.chmodSync(sqlitePath, 0o755);
      console.log('Set executable permissions on:', sqlitePath);
    }
    try {
      const { stdout } = await execAsync(sqlitePath, ['--version'], {
        timeout: 5000
      });
      const installedVersion = stdout.trim().split(/\s+/)[0];
      if (installedVersion !== this.sqliteVersion) {
        throw new Error(
          `SQLite version mismatch. Expected ${this.sqliteVersion}, got ${installedVersion}`
        );
      }
      console.log('SQLite successfully installed:', installedVersion);
    } catch (error) {
      console.error('SQLite installation verification failed:', error);
      throw error;
    }
    return sqlitePath;
  }

  private async ensureGit(): Promise<string> {
    const execAsync = promisify(execFile);
    const isWindows = process.platform === 'win32';
    const gitDir = path.join(this.runtimePath, 'git');
    const gitPath = path.join(gitDir, isWindows ? 'git.exe' : 'bin/git');

    try {
      const { stdout } = await execAsync(gitPath, ['--version'], { timeout: 5000 });
      const currentVersion = stdout.trim().match(/(\d+\.\d+\.\d+)/)?.[1];
      if (currentVersion === this.gitVersion) {
        console.log('Git already installed:', currentVersion);
        return gitPath;
      }
      console.warn(`Wrong Git version. Expected ${this.gitVersion}, found ${currentVersion}`);
    } catch (error) {
      console.warn('Git not found or not executable:', error);
    }

    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
    }

    const url = isWindows
      ? `https://github.com/git-for-windows/git/releases/download/v${this.gitVersion}.windows.1/MinGit-${this.gitVersion}-64-bit.zip`
      : `https://github.com/baulk/git-minimal/releases/download/v${this.gitVersion}/git-minimal-musl-v${this.gitVersion}-linux-amd64.tar.xz`;
    const archivePath = path.join(
      os.tmpdir(),
      `Renaissance-git-${this.gitVersion}.${isWindows ? 'zip' : 'tar.xz'}`
    );
    const stagingDir = path.join(this.runtimePath, '.staging');
    console.log('Downloading Git from:', url);

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(60000)
      });
      if (!response.ok) {
        throw new Error(`Failed to download Git: ${response.status} ${response.statusText}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(archivePath, buffer);
      console.log('Downloaded Git to:', archivePath);
      console.log('Extracting Git to staging:', stagingDir);
      if (fs.existsSync(stagingDir)) {
        fs.rmSync(stagingDir, { recursive: true, force: true });
      }
      fs.mkdirSync(stagingDir, { recursive: true });
      if (isWindows) {
        await extract(archivePath, { dir: stagingDir });
      } else {
        await execAsync('tar', ['-xf', archivePath, '-C', stagingDir], {
          timeout: 120000
        });
      }
      console.log('Git extracted to staging successfully');
      console.log('Moving Git from staging to:', gitDir);
      if (isWindows) {
        fs.renameSync(stagingDir, gitDir);
      } else {
        fs.renameSync(
          path.join(stagingDir, `git-minimal-musl-v${this.gitVersion}-linux-amd64`),
          gitDir
        );
      }
      console.log('Git moved successfully');
    } catch (error) {
      console.error('Git download/extraction failed:', error);
      throw error;
    } finally {
      if (fs.existsSync(archivePath)) {
        fs.rmSync(archivePath, { force: true });
        console.log('Cleaned up archive');
      }
      if (fs.existsSync(stagingDir)) {
        fs.rmSync(stagingDir, { recursive: true, force: true });
        console.log('Cleaned up staging directory');
      }
    }

    if (!fs.existsSync(gitPath)) {
      throw new Error(`Git executable not found after extraction: ${gitPath}`);
    }
    if (!isWindows) {
      fs.chmodSync(gitPath, 0o755);
      console.log('Set executable permissions on:', gitPath);
    }

    try {
      const { stdout } = await execAsync(gitPath, ['--version'], { timeout: 5000 });
      const installedVersion = stdout.trim().match(/(\d+\.\d+\.\d+)/)?.[1];
      if (installedVersion !== this.gitVersion) {
        throw new Error(
          `Git version mismatch. Expected ${this.gitVersion}, got ${installedVersion}`
        );
      }
      console.log('Git successfully installed:', installedVersion);
    } catch (error) {
      console.error('Git installation verification failed:', error);
      throw error;
    }
    return gitPath;
  }

  private async ensureBackendRuns() {
    const serverPort = await getPort();

    const backend: ChildProcess = this.runServer(serverPort);
    const retries = 10;
    const waitTill = 500;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`http://127.0.0.1:${serverPort}/health`, {
          signal: AbortSignal.timeout(1000)
        });

        if (response.ok) {
          console.log('Backend is ready');
          return serverPort;
        }
      } catch {
        // Backend may still be starting.
      }
      await new Promise((resolve) => setTimeout(resolve, waitTill));
    }
    backend.kill();
    throw new Error('Backend not responding. Check backend logs.');
  }
  private runServer(serverPort: number): ChildProcess {
    console.log('Is Packaged:', this.isPackaged);
    let backend: ChildProcess;

    if (!this.isPackaged) {
      backend = spawn('pnpm', ['--filter', '@renaissance/server', 'dev'], {
        env: {
          ...process.env,
          PORT: String(serverPort),
          RENAISSANCE_INSTALL_PATH: this.installPath,
          RENAISSANCE_RUNTIME_PATH: this.runtimePath
        },
        stdio: 'inherit'
      });
    } else {
      const bundleJs = path.join(process.resourcesPath, 'server-bin', 'index.cjs');

      if (!fs.existsSync(bundleJs)) {
        console.error(`Server bundle not found at: ${bundleJs}`);
        console.error('Falling back to development mode');
        backend = spawn('pnpm', ['--filter', '@renaissance/server', 'dev'], {
          env: {
            ...process.env,
            PORT: String(serverPort),
            RENAISSANCE_INSTALL_PATH: this.installPath,
            RENAISSANCE_RUNTIME_PATH: this.runtimePath
          },
          stdio: 'inherit'
        });
      } else {
        backend = spawn(process.execPath, ['--no-warnings', bundleJs], {
          env: {
            ...process.env,
            PORT: String(serverPort),
            RENAISSANCE_INSTALL_PATH: this.installPath,
            RENAISSANCE_RUNTIME_PATH: this.runtimePath,
            ELECTRON_RUN_AS_NODE: '1'
          },
          stdio: 'inherit'
        });
      }
    }
    return backend;
  }

  private async ensureBaseTables(serverPort: number) {
    try {
      const response = await fetch(`http://127.0.0.1:${serverPort}/migrate`, {
        method: 'POST',
        signal: AbortSignal.timeout(1000)
      });

      if (response.ok) {
        console.log('Migrations ran successfully!');
        return;
      }
    } catch (error) {
      console.error('Failed to run migrations:', error);
      throw error;
    }
  }

  private async ensureUserEntry(serverPort: number) {
    try {
      const response = await fetch(`http://127.0.0.1:${serverPort}/migrate`, {
        method: 'POST',
        signal: AbortSignal.timeout(1000)
      });

      if (response.ok) {
        console.log('Migrations ran successfully!');
        return;
      }
    } catch (error) {
      console.error('Failed to run migrations:', error);
      throw error;
    }
  }
}
