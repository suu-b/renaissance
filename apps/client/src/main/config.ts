import { app } from 'electron'

import path from 'node:path'
import os from 'node:os'

export const GIT_VERSION = '2.53.0'
export const SQLITE_VERSION = '3.50.4'

export const RENAISSANCE_INSTALL_PATH: string = path.join(app.getPath('userData'), 'renaissance')
export const RENAISSANCE_RUNTIME_PATH: string = path.join(RENAISSANCE_INSTALL_PATH, 'runtime')

export const USER_RENAISSANCE_DIR_PATH: string = path.join(os.homedir(), 'renaissance')
export const USER_RENAISSANCE_WS_DIR_PATH: string = path.join(USER_RENAISSANCE_DIR_PATH, 'workspace')
export const USER_RENAISSANCE_TMP_WS_DIR_PATH: string = path.join(USER_RENAISSANCE_DIR_PATH, 'workspace-temp')

export const USER_RENAISSANCE_PROFILE_PATH: string = path.join(USER_RENAISSANCE_DIR_PATH, 'user.json')
