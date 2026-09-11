import { generateCodeVerifier, generateCodeChallenge, generateState } from '../utils/pkce';
import { config } from '../config';

interface OAuthState {
  verifier: string;
  state: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
}

export class OAuthService {
  private static instance: OAuthService;
  private oauthState: OAuthState | null = null;

  private constructor() { }

  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  startOAuthFlow(): string {
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    const state = generateState();

    this.oauthState = { verifier, state };
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('oauth_verifier', verifier);
      sessionStorage.setItem('oauth_state', state);
    }

    const params = new URLSearchParams({
      client_id: 'renaissance-desktop',
      redirect_uri: 'renaissance://auth/callback',
      response_type: 'code',
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state: state,
    });

    return `${config.getRenaissanceURL}/oauth?${params.toString()}`;
  }

  async handleCallback(callbackUrl: string): Promise<TokenResponse> {
    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      throw new Error('Invalid callback URL');
    }

    const savedState = this.oauthState?.state || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('oauth_state') : null);
    const savedVerifier = this.oauthState?.verifier || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('oauth_verifier') : null);

    if (state !== savedState || !savedVerifier) {
      throw new Error('State mismatch - possible CSRF attack');
    }

    const tokenResponse = await fetch(`${config.getRenaissanceURL}/api/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        code_verifier: savedVerifier,
        redirect_uri: 'renaissance://auth/callback',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.error?.message || 'Failed to exchange code for tokens');
    }

    const data = await tokenResponse.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Token exchange failed');
    }

    this.oauthState = null; // Clear state
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('oauth_verifier');
      sessionStorage.removeItem('oauth_state');
    }

    return data.data as TokenResponse;
  }

  // Get current OAuth state (for testing)
  getState(): OAuthState | null {
    return this.oauthState;
  }
}