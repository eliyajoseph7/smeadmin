import type { TokenData, Admin } from '../../types/auth';

const TOKEN_STORAGE_KEY = 'smeadmin_tokens';
const ADMIN_STORAGE_KEY = 'smeadmin_admin';

export class TokenManager {
  private static instance: TokenManager;
  private tokens: TokenData | null = null;
  private admin: Admin | null = null;

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Store tokens and admin data
   */
  setTokens(tokens: Omit<TokenData, 'expiresAt'>, admin: Admin): void {
    try {
      const tokenData: TokenData = {
        ...tokens,
        expiresAt: Date.now() + (tokens.expiresIn * 1000)
      };

      this.tokens = tokenData;
      this.admin = admin;

      // Store in localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    } catch (error) {
      console.error('Error storing tokens to localStorage:', error);
      // Clear potentially corrupted data
      this.clearTokens();
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Update tokens (for refresh)
   */
  updateTokens(tokens: Omit<TokenData, 'expiresAt'>): void {
    if (!this.tokens) return;

    try {
      const tokenData: TokenData = {
        ...tokens,
        expiresAt: Date.now() + (tokens.expiresIn * 1000)
      };

      this.tokens = tokenData;
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error updating tokens in localStorage:', error);
      // Clear potentially corrupted data
      this.clearTokens();
      throw new Error('Failed to update authentication tokens');
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.tokens?.refreshToken || null;
  }

  /**
   * Get current admin data
   */
  getAdmin(): Admin | null {
    return this.admin;
  }

  /**
   * Get all token data
   */
  getTokens(): TokenData | null {
    return this.tokens;
  }

  /**
   * Check if access token is expired
   */
  isAccessTokenExpired(): boolean {
    if (!this.tokens) return true;
    
    // Add 5 minute buffer before actual expiry
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() >= (this.tokens.expiresAt - bufferTime);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.tokens && this.admin && !this.isAccessTokenExpired());
  }

  /**
   * Check if refresh token exists (for token refresh)
   */
  hasRefreshToken(): boolean {
    return !!(this.tokens?.refreshToken);
  }

  /**
   * Clear all tokens and admin data
   */
  clearTokens(): void {
    this.tokens = null;
    this.admin = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }

  /**
   * Load tokens and admin data from localStorage
   */
  private loadFromStorage(): void {
    try {
      const tokensJson = localStorage.getItem(TOKEN_STORAGE_KEY);
      const adminJson = localStorage.getItem(ADMIN_STORAGE_KEY);

      // Validate and parse tokens
      if (tokensJson && tokensJson !== 'undefined' && tokensJson !== 'null') {
        try {
          this.tokens = JSON.parse(tokensJson);
        } catch (parseError) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }

      // Validate and parse admin data
      if (adminJson && adminJson !== 'undefined' && adminJson !== 'null') {
        try {
          this.admin = JSON.parse(adminJson);
        } catch (parseError) {
          localStorage.removeItem(ADMIN_STORAGE_KEY);
        }
      }

      // Clear if tokens are expired
      if (this.tokens && Date.now() >= this.tokens.expiresAt) {
        this.clearTokens();
      }
    } catch (error) {
      this.clearTokens();
    }
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();
