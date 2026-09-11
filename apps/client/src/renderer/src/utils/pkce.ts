import CryptoJS from 'crypto-js';

export function generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);

    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function generateCodeChallenge(verifier: string): string {
  const hash = CryptoJS.SHA256(verifier);
  // Convert WordArray to Base64 string
  const base64 = hash.toString(CryptoJS.enc.Base64);
  // Convert to URL-safe Base64
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
