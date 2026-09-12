import { config } from '../config';

interface OAuthStartResponse {
  success: boolean;
  data: {
    authUrl: string;
    state: string;
  };
}

interface OAuthCallbackResponse {
  success: boolean;
  data: {
    authenticated: boolean;
    email?: string;
  };
}

export class OAuthService {
  private static instance: OAuthService;

  private constructor() { }

  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  /**
   * Start OAuth flow by calling local server
   * Local server handles PKCE generation and returns auth URL
   */
  async startOAuthFlow(email?: string): Promise<string> {
    if (!config.serverUrl) {
      throw new Error('Local server is not available');
    }
    const response = await fetch(`${config.serverUrl}/api/v1/user/auth/oauth/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to start OAuth flow');
    }

    const data: OAuthStartResponse = await response.json();
    
    if (!data.success || !data.data.authUrl) {
      throw new Error('Invalid response from local server');
    }

    return data.data.authUrl;
  }

  /**
   * Handle OAuth callback by sending to local server
   * Local server handles token exchange and secure storage
   * Renderer never handles sensitive tokens
   */
  async handleCallback(callbackUrl: string): Promise<OAuthCallbackResponse> {
    if (!config.serverUrl) {
      throw new Error('Local server is not available');
    }

    const response = await fetch(`${config.serverUrl}/api/v1/user/auth/oauth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ callbackUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to handle OAuth callback');
    }

    const data: OAuthCallbackResponse = await response.json();
    
    if (!data.success) {
      throw new Error('OAuth callback failed');
    }

    return data;
  }

  /**
   * Check authentication status via local server
   */
  async checkAuthStatus(email: string): Promise<boolean> {
    if (!config.serverUrl) {
      return false;
    }

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/auth/me?email=${encodeURIComponent(email)}`);
      return response.ok;
    } catch (error) {
      console.error('Failed to check auth status:', error);
      return false;
    }
  }

  /**
   * Logout via local server
   */
  async logout(email: string): Promise<boolean> {
    if (!config.serverUrl) {
      return false;
    }

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to logout:', error);
      return false;
    }
  }
}