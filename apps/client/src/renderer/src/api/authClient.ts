import { UserProfile } from "../types/auth";

// OAuth removed - these functions are stubs for compatibility

export async function getAuthStatus(): Promise<boolean> {
  // OAuth removed - always return false
  return false;
}

export async function getCurrentUser(): Promise<UserProfile> {
  // OAuth removed - throw error since this should never be called
  throw new Error('OAuth functionality has been removed');
}
