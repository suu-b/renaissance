import fs from 'node:fs'
import path from 'node:path'
import { USER_RENAISSANCE_PROFILE_PATH } from '../config'

export function saveUserProfile(profile: object): { success: boolean; error?: string } {
  try {
    const profileDir = path.dirname(USER_RENAISSANCE_PROFILE_PATH)
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true })
    }
    fs.writeFileSync(USER_RENAISSANCE_PROFILE_PATH, JSON.stringify(profile, null, 2), 'utf-8')
    console.log('User profile saved to:', USER_RENAISSANCE_PROFILE_PATH)
    return { success: true }
  } catch (error) {
    console.error('Failed to save user profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function loadUserProfile(): {
  success: boolean
  profile?: object
  error?: string
} {
  try {
    if (!fs.existsSync(USER_RENAISSANCE_PROFILE_PATH)) {
      return { success: false, error: 'No profile found' }
    }
    const raw = fs.readFileSync(USER_RENAISSANCE_PROFILE_PATH, 'utf-8')
    const profile = JSON.parse(raw)
    return { success: true, profile }
  } catch (error) {
    console.error('Failed to load user profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
