import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import {
  GIT_VERSION,
  SQLITE_VERSION,
  USER_RENAISSANCE_DIR_PATH,
  USER_RENAISSANCE_WS_DIR_PATH,
  USER_RENAISSANCE_TMP_WS_DIR_PATH,
} from '../config'
import {
  loadManifest,
  saveManifest,
  ensureGitInstalled,
  ensureSqliteInstalled,
} from './installer'

const execAsync = promisify(exec)

export function folderExistsInHome(folderName: string): boolean {
  const folderPath = path.join(os.homedir(), folderName)
  return fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()
}

export function checkFolderExists(folderPath: string): boolean {
  try {
    return fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()
  } catch (error) {
    console.error('Error checking folder:', error)
    return false
  }
}

export async function checkLeftovers(): Promise<boolean> {
  try {
    const hasRenaissance =
      fs.existsSync(USER_RENAISSANCE_DIR_PATH) && fs.statSync(USER_RENAISSANCE_DIR_PATH).isDirectory()
    const hasWorkspace =
      fs.existsSync(USER_RENAISSANCE_WS_DIR_PATH) && fs.statSync(USER_RENAISSANCE_WS_DIR_PATH).isDirectory()
    const hasWorkspaceTemp =
      fs.existsSync(USER_RENAISSANCE_TMP_WS_DIR_PATH) && fs.statSync(USER_RENAISSANCE_TMP_WS_DIR_PATH).isDirectory()

    return hasRenaissance && (hasWorkspace || hasWorkspaceTemp)
  } catch (error) {
    console.error('Error checking leftovers:', error)
    return false
  }
}

export async function ensureWorkspaceSetup(withAccount: boolean): Promise<{ workspacePath: string }> {
  console.log('Ensuring workspace setup withAccount:', withAccount)
  const workspacePath = withAccount ? USER_RENAISSANCE_WS_DIR_PATH : USER_RENAISSANCE_TMP_WS_DIR_PATH
  console.log('Renaissance path:', USER_RENAISSANCE_DIR_PATH)
  console.log('Workspace path:', workspacePath)

  // Create folders idempotently
  if (!fs.existsSync(USER_RENAISSANCE_DIR_PATH)) {
    fs.mkdirSync(USER_RENAISSANCE_DIR_PATH, { recursive: true })
    console.log('Created renaissance folder:', USER_RENAISSANCE_DIR_PATH)
  } else {
    console.log('Renaissance folder already exists:', USER_RENAISSANCE_DIR_PATH)
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
    console.log('Initializing git in:', workspacePath)
    await execAsync('git init', { cwd: workspacePath, timeout: 10000 })
    console.log('Git initialized in:', workspacePath)
  } else {
    console.log('Git already initialized in:', workspacePath)
  }

  console.log('Workspace setup complete:', { workspacePath })
  return { workspacePath }
}

export async function checkSetupState(): Promise<{
  hasManifest: boolean
  hasWorkspace: boolean
  gitInstalled: boolean
  sqliteInstalled: boolean
  setupComplete: boolean
}> {
  try {
    const manifest = await loadManifest()
    const folderExists = fs.existsSync(USER_RENAISSANCE_DIR_PATH)

    return {
      hasManifest: !!manifest,
      hasWorkspace: folderExists,
      gitInstalled: !!manifest?.gitPath,
      sqliteInstalled: !!manifest?.sqlitePath,
      setupComplete: !!manifest && folderExists,
    }
  } catch (error) {
    console.error('Error checking setup state:', error)
    return {
      hasManifest: false,
      hasWorkspace: false,
      gitInstalled: false,
      sqliteInstalled: false,
      setupComplete: false,
    }
  }
}

export async function completeSetup(withAccount: boolean): Promise<{
  success: boolean
  gitPath?: string
  sqlitePath?: string
  workspacePath?: string
  error?: string
}> {
  try {
    console.log('Starting complete setup withAccount:', withAccount)
    const manifest = await loadManifest()

    console.log('Phase 1: Installing git...')
    const gitPath = await ensureGitInstalled(manifest)
    console.log('Git installation complete:', gitPath)

    console.log('Phase 2: Installing sqlite...')
    const sqlitePath = await ensureSqliteInstalled(manifest)
    console.log('SQLite installation complete:', sqlitePath)

    console.log('Phase 3: Setting up workspace...')
    const workspaceResult = await ensureWorkspaceSetup(withAccount)
    console.log('Workspace setup complete:', workspaceResult)

    console.log('Phase 4: Saving manifest...')
    await saveManifest({
      gitVersion: GIT_VERSION,
      gitPath,
      sqliteVersion: SQLITE_VERSION,
      sqlitePath,
      installedAt: new Date().toISOString(),
      platform: process.platform,
    })
    console.log('Manifest saved')

    console.log('Complete setup finished successfully')
    return {
      success: true,
      gitPath,
      sqlitePath,
      ...workspaceResult,
    }
  } catch (error) {
    console.error('Complete setup failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
