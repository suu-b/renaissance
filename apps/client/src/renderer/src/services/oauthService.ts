// OAuth functionality has been removed
// This service is kept as a stub for compatibility

export class OAuthService {
  private static instance: OAuthService;

  private constructor() { }

  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  async startOAuthFlow(_email?: string): Promise<string> {
    // OAuth removed - this will never be called
    throw new Error('OAuth functionality has been removed');
  }

  async handleCallback(_callbackUrl: string): Promise<any> {
    // OAuth removed - this will never be called
    throw new Error('OAuth functionality has been removed');
  }

  async logout(_email: string): Promise<boolean> {
    // OAuth removed - no-op
    return true;
  }

  async checkAuthStatus(_email: string): Promise<boolean> {
    // OAuth removed - always return false (not authenticated)
    return false;
  }
}
