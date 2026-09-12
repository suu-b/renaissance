import keytar from 'keytar'

interface TokenData {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
}

export class TokenStorageService {
  constructor() {}

  async saveTokens(email: string, tokens: TokenData): Promise<boolean> {
    try {
      await keytar.setPassword("renaissance", email, JSON.stringify(tokens));
      console.log(`Tokens saved successfully for ${email}`);
      return true;
    } catch (error) {
      console.error(`Failed to save tokens for ${email}:`, error);
      return false;
    }
  }

  async getTokens(email: string): Promise<TokenData | null> {
    try {
      const tokenString = await keytar.getPassword("renaissance", email);
      if (!tokenString) {
        return null;
      }
      return JSON.parse(tokenString) as TokenData;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error(`Failed to retrieve tokens for ${email}:`, error);
      }
      return null;
    }
  }

  async deleteTokens(email: string): Promise<boolean> {
    try {
      const result = await keytar.deletePassword("renaissance", email);
      console.log(`Tokens deleted for ${email}`);
      return result;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error(`Failed to delete tokens for ${email}:`, error);
      }
      return false;
    }
  }

  async hasTokens(email: string): Promise<boolean> {
    try {
      const tokenString = await keytar.getPassword("renaissance", email);
      return tokenString !== null;
    } catch (error) {
      return false;
    }
  }

  async getAccessToken(email: string): Promise<string | null> {
    const tokens = await this.getTokens(email);
    return tokens?.access_token || null;
  }

  async updateAccessToken(email: string, newAccessToken: string): Promise<boolean> {
    try {
      const tokens = await this.getTokens(email);
      if (!tokens) {
        return false;
      }
      tokens.access_token = newAccessToken;
      return await this.saveTokens(email, tokens);
    } catch (error) {
      console.error(`Failed to update access token for ${email}:`, error);
      return false;
    }
  }
}