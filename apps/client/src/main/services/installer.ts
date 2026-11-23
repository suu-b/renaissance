import fs from 'node:fs'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import os from 'node:os'
import extract from 'extract-zip'
import { GIT_VERSION, SQLITE_VERSION, RENAISSANCE_RUNTIME_PATH as defaultRuntimeDir } from '../config'
import { InstallationManifest } from '../types'

const execAsync = promisify(exec)

export async function ensureGitInstalled(
    manifest: InstallationManifest | null,
    version: string = GIT_VERSION,
    runtimeDir: string = defaultRuntimeDir
): Promise<string> {
    console.log('Ensuring git installation...')
    console.log('Current manifest:', manifest)

    // Check if manifest has valid git installation
    if (manifest?.gitPath && manifest.gitVersion === version) {
        const gitPath = manifest.gitPath
        console.log('Checking existing git path from manifest:', gitPath)
        if (fs.existsSync(gitPath)) {
            // Verify it works
            try {
                await execAsync(`"${gitPath}" --version`, { timeout: 5000 })
                console.log('Git already installed and working at:', gitPath)
                return gitPath
            } catch {
                console.log('Git path exists but invalid, reinstalling')
            }
        } else {
            console.log('Git path from manifest does not exist:', gitPath)
        }
    }

    console.log('Installing git...')
    return await installGit(version, runtimeDir)
}

export async function installGit(
    version: string = GIT_VERSION,
    runtimeDir: string = defaultRuntimeDir
): Promise<string> {
    const platform = process.platform
    let result: string | false = false

    if (platform.startsWith('win')) {
        result = await installWinGit(version, runtimeDir)
    } else if (platform.startsWith('linux')) {
        result = await installLinGit(version, runtimeDir)
    } else {
        throw new Error('Unsupported platform', { cause: platform })
    }

    if (!result) throw new Error('Git failed to install')
    console.log('Git installed successfully at:', result)
    return result
}

export async function ensureSqliteInstalled(
    manifest: InstallationManifest | null,
    version: string = SQLITE_VERSION,
    runtimeDir: string = defaultRuntimeDir
): Promise<string> {
    console.log('Ensuring sqlite installation...')
    console.log('Current manifest:', manifest)

    // Check if manifest has valid sqlite installation
    if (manifest?.sqlitePath && manifest.sqliteVersion === version) {
        const sqlitePath = manifest.sqlitePath
        console.log('Checking existing sqlite path from manifest:', sqlitePath)
        if (fs.existsSync(sqlitePath)) {
            // Verify it works
            try {
                await execAsync(`"${sqlitePath}" --version`, { timeout: 5000 })
                console.log('SQLite already installed and working at:', sqlitePath)
                return sqlitePath
            } catch {
                console.log('SQLite path exists but invalid, reinstalling')
            }
        } else {
            console.log('SQLite path from manifest does not exist:', sqlitePath)
        }
    }

    console.log('Installing sqlite...')
    return await installSqlite(version, runtimeDir)
}

export async function installSqlite(
    version: string = SQLITE_VERSION,
    runtimeDir: string = defaultRuntimeDir
): Promise<string> {
    const platform = process.platform
    let result: string | false = false

    if (platform.startsWith('win')) {
        result = await installWinSqlite(version, runtimeDir)
    } else if (platform.startsWith('linux')) {
        result = await installLinSqlite(version, runtimeDir)
    } else {
        throw new Error('Unsupported platform', { cause: platform })
    }

    if (!result) throw new Error('SQLite failed to install')
    console.log('SQLite installed successfully at:', result)
    return result
}

export async function installWinGit(
    version: string = GIT_VERSION,
    runtimeDir: string = defaultRuntimeDir
): Promise<string | false> {
    try {
        console.log('Installing Git for Windows...')
        const url =
            `https://github.com/git-for-windows/git/releases/download/` +
            `v${version}.windows.1/MinGit-${version}-64-bit.zip`
        const archivePath = path.join(os.tmpdir(), `Renaissance-MinGit-${version}.zip`)
        console.log('Downloading Git from:', url)
        console.log('Archive path:', archivePath)

        const response = await fetch(url)
        if (!response.ok) {
            console.error(`Failed to download Git: ${response.status} ${response.statusText}`)
            return false
        }
        const buffer = Buffer.from(await response.arrayBuffer())
        fs.writeFileSync(archivePath, buffer)
        console.log('Downloaded Git to:', archivePath)

        console.log('Extracting Git to:', runtimeDir)
        await extract(archivePath, { dir: runtimeDir })
        fs.rmSync(archivePath)
        console.log('Cleaned up archive')

        const gitPath = path.join(runtimeDir, 'git.exe')
        console.log('Git installation path:', gitPath)
        return gitPath
    } catch (error) {
        console.error('Failed to install Git for Windows:', error)
        return false
    }
}

export async function installLinGit(
    version: string = GIT_VERSION,
    runtimeDir: string = defaultRuntimeDir
): Promise<string | false> {
    try {
        console.log('Installing Git for Linux...')
        const url = `https://github.com/baulk/git-minimal/releases/download/v${version}/git-minimal-musl-v${version}-linux-amd64.tar.xz`
        const archivePath = path.join(os.tmpdir(), `Renaissance-git-${version}.tar.xz`)
        console.log('Downloading Git from:', url)
        console.log('Archive path:', archivePath)

        const response = await fetch(url)
        if (!response.ok) {
            console.error(`Failed to download Git: ${response.status} ${response.statusText}`)
            return false
        }
        const buffer = Buffer.from(await response.arrayBuffer())
        fs.writeFileSync(archivePath, buffer)
        console.log('Downloaded Git to:', archivePath)

        // Extract tar.xz using system tar
        console.log('Extracting Git to:', runtimeDir)
        await execAsync(`tar -xf ${archivePath} -C ${runtimeDir}`, { timeout: 120000 })
        console.log('Extraction complete')

        // Cleanup
        fs.rmSync(archivePath)
        console.log('Cleaned up archive')

        // Return the path to git executable (git-minimal extracts to versioned directory)
        const gitPath = path.join(
            runtimeDir,
            `git-minimal-musl-v${version}-linux-amd64`,
            'bin',
            'git'
        )
        console.log('Git installation path:', gitPath)
        return gitPath
    } catch (error) {
        console.error('Failed to install Git for Linux:', error)
        return false
    }
}

export async function installWinSqlite(
    _version: string = SQLITE_VERSION,
    runtimeDir: string = defaultRuntimeDir
): Promise<string | false> {
    try {
        console.log('Installing SQLite for Windows...')
        // SQLite uses date-based versioning in URLs
        const url = `https://www.sqlite.org/2025/sqlite-tools-win32-x86-3450100.zip`
        const archivePath = path.join(os.tmpdir(), `Renaissance-sqlite-tools.zip`)
        console.log('Downloading SQLite from:', url)
        console.log('Archive path:', archivePath)

        const response = await fetch(url)
        if (!response.ok) {
            console.error(`Failed to download SQLite: ${response.status} ${response.statusText}`)
            return false
        }
        const buffer = Buffer.from(await response.arrayBuffer())
        fs.writeFileSync(archivePath, buffer)
        console.log('Downloaded SQLite to:', archivePath)

        console.log('Extracting SQLite to:', runtimeDir)
        await extract(archivePath, { dir: runtimeDir })
        fs.rmSync(archivePath)
        console.log('Cleaned up archive')

        const sqlitePath = path.join(runtimeDir, 'sqlite3.exe')
        console.log('SQLite installation path:', sqlitePath)
        return sqlitePath
    } catch (error) {
        console.error('Failed to install SQLite for Windows:', error)
        return false
    }
}

export async function installLinSqlite(
    version: string = SQLITE_VERSION,
    runtimeDir: string = defaultRuntimeDir
): Promise<string | false> {
    try {
        console.log('Installing SQLite for Linux...')
        const versionCode = sqliteVersionCode(version)
        const url = `https://www.sqlite.org/2025/sqlite-tools-linux-x64-${versionCode}.zip`
        const archivePath = path.join(os.tmpdir(), `Renaissance-sqlite-${version}.zip`)

        fs.mkdirSync(runtimeDir, { recursive: true })

        console.log('Downloading SQLite:', url)
        console.log('Archive path:', archivePath)

        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to download SQLite: ${response.status} ${response.statusText}`)
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        fs.writeFileSync(archivePath, buffer)
        console.log('Downloaded SQLite to:', archivePath)

        console.log('Extracting SQLite to:', runtimeDir)
        await extract(archivePath, { dir: runtimeDir })
        fs.rmSync(archivePath)
        console.log('Cleaned up archive')

        const sqlitePath = path.join(runtimeDir, 'sqlite3')

        // Linux executable permission
        fs.chmodSync(sqlitePath, 0o755)
        console.log('Set executable permissions on:', sqlitePath)
        console.log('SQLite installed at:', sqlitePath)

        return sqlitePath
    } catch (error) {
        console.error('Failed to install SQLite for Linux:', error)
        return false
    }
}

export function sqliteVersionCode(version: string): string {
    const [major, minor, patch] = version.split('.').map(Number)
    return `${major}${minor.toString().padStart(2, '0')}${patch.toString().padStart(2, '0')}00`
}

export async function checkSqliteInstalled(): Promise<boolean> {
    try {
        await execAsync('sqlite3 --version', { timeout: 5000 })
        return true
    } catch (error) {
        console.error('SQLite not found:', error)
        return false
    }
}

export async function checkGitInstalled(): Promise<boolean> {
    try {
        await execAsync('git --version', { timeout: 5000 })
        return true
    } catch (error) {
        console.error('Git not found:', error)
        return false
    }
}

export async function loadManifest(
    runtimeDir: string = defaultRuntimeDir
): Promise<InstallationManifest | null> {
    try {
        const manifestPath = path.join(runtimeDir, 'manifest.json')
        console.log('Loading manifest from:', manifestPath)
        if (!fs.existsSync(manifestPath)) {
            console.log('Manifest file does not exist')
            return null
        }
        const content = fs.readFileSync(manifestPath, 'utf-8')
        const manifest = JSON.parse(content)
        console.log('Loaded manifest:', manifest)
        return manifest
    } catch (error) {
        console.error('Failed to load manifest:', error)
        return null
    }
}

export async function saveManifest(
    manifest: InstallationManifest,
    runtimeDir: string = defaultRuntimeDir
): Promise<void> {
    try {
        const manifestPath = path.join(runtimeDir, 'manifest.json')
        console.log('Saving manifest to:', manifestPath)
        console.log('Manifest content:', manifest)
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
        console.log('Manifest saved successfully')
    } catch (error) {
        console.error('Failed to save manifest:', error)
        throw error
    }
}
