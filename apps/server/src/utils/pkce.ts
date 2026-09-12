import crypto from "crypto";

/**
 * Generate a random code verifier for PKCE
 * @returns A random 43-character string for use as code verifier
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.randomFillSync(array);
  return base64UrlEncode(array);
}

/**
 * Generate a code challenge from a code verifier
 * @param verifier The code verifier to transform
 * @returns A base64url-encoded SHA-256 hash of the verifier
 */
export function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return base64UrlEncode(hash);
}

/**
 * Generate a random state parameter for CSRF protection
 * @returns A random string for use as state parameter
 */
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.randomFillSync(array);
  return base64UrlEncode(array);
}

/**
 * Base64url encode without padding
 * @param buffer The buffer to encode
 * @returns Base64url encoded string without padding
 */
function base64UrlEncode(buffer: Buffer | Uint8Array): string {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}