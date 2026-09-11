export interface AuthCodeData {
  codeChallenge: string
  userId: string
  email: string
  accessToken: string
  refreshToken: string
  expiresAt: number
}

declare global {
  var __authCodesMap: Map<string, AuthCodeData> | undefined
}

export const authCodes = globalThis.__authCodesMap || new Map<string, AuthCodeData>()
if (process.env.NODE_ENV !== 'production') {
  globalThis.__authCodesMap = authCodes
}

export function saveAuthCode(code: string, data: AuthCodeData) {
  authCodes.set(code, data)
}

export function getAuthCode(code: string): AuthCodeData | undefined {
  return authCodes.get(code)
}

export function deleteAuthCode(code: string): boolean {
  return authCodes.delete(code)
}

export function cleanupExpiredCodes() {
  const now = Date.now()
  for (const [code, data] of authCodes.entries()) {
    if (data.expiresAt < now) {
      authCodes.delete(code)
    }
  }
}
