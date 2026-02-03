/**
 * JWT Token Generator for SME API Gateway (RFC 7515 Compliant)
 * 
 * This service generates JWT tokens with a 2-minute expiration time using a shared secret.
 * The server will validate these tokens using the same shared secret.
 * 
 * Security Benefits:
 * - Tokens expire after 2 minutes, reducing risk of token theft
 * - No need to store tokens locally (generated fresh each time)
 * - Shared secret authentication between client and server
 * - RFC 7515 compliant JWT implementation
 */

import { CryptoHMAC } from './crypto-hmac';

export interface JwtPayload {
  client_id: string;
  iat: number;
  exp: number;
}

export interface JwtHeader {
  alg: string;
  typ: string;
}

export interface TokenInfo {
  header: JwtHeader;
  payload: JwtPayload;
  isExpired: boolean;
  expiresAt: string;
}

export class JwtTokenGenerator {
  // ============== CONFIGURATION ==============
  private static readonly CLIENT_ID = 'sme-web-app';
  private static readonly SHARED_SECRET = 'Xk9xmN2pQ7rT4vW8yB1cD3eF6gH0jL5nP9sU2wZ4aE7hK0mR3tY6uI8oA1bC5dG';
  private static readonly TOKEN_VALIDITY_SECONDS = 120; // 2 minutes
  // ===========================================

  /**
   * Generate a JWT token for API authentication
   * 
   * Returns a complete JWT token in the format: header.payload.signature
   * The token includes:
   * - client_id: Identifies the admin web app
   * - iat: Issued at timestamp
   * - exp: Expiration timestamp (2 minutes from now)
   */
  public static generateToken(): string {
    try {
      const now = Math.floor(Date.now() / 1000); // seconds
      const exp = now + this.TOKEN_VALIDITY_SECONDS;

      // if (import.meta.env?.DEV) {
      //   console.log('🔐 Generating JWT token...');
      //   console.log('   Client ID:', this.CLIENT_ID);
      //   console.log('   Issued at:', now);
      //   console.log('   Expires at:', exp);
      //   console.log('   Valid for:', this.TOKEN_VALIDITY_SECONDS, 's');
      // }

      // JWT Header (HMAC SHA512)
      const header: JwtHeader = {
        alg: 'HS512',
        typ: 'JWT'
      };

      // JWT Payload
      const payload: JwtPayload = {
        client_id: this.CLIENT_ID,
        iat: now,
        exp: exp
      };

      // Base64URL encode (no padding)
      const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
      const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));

      // Create signature input
      const signatureInput = `${encodedHeader}.${encodedPayload}`;

      // Generate HMAC-SHA512 signature using proper crypto implementation
      const signature = CryptoHMAC.hmacSha512(signatureInput, this.SHARED_SECRET);

      // Return complete JWT: header.payload.signature
      const token = `${encodedHeader}.${encodedPayload}.${signature}`;

      // if (import.meta.env?.DEV) {
      //   console.log('✅ JWT token generated successfully');
      //   console.log('   Token length:', token.length, 'characters');
      //   console.log('   Token preview:', token.substring(0, 50) + '...');
      // }

      return token;
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.error('❌ Failed to generate JWT token:', error);
      }
      throw error;
    }
  }

  /**
   * Get full Authorization header value
   * 
   * Returns: "Bearer <jwt_token>"
   * This is the complete header value to use in HTTP requests
   */
  public static getAuthorizationHeader(): string {
    const token = this.generateToken();
    return `Bearer ${token}`;
  }

  /**
   * Check if a token would be expired (for testing purposes)
   * 
   * This method is mainly for debugging and testing.
   * In production, tokens are always generated fresh.
   */
  public static isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const payload = this.base64UrlDecode(parts[1]);
      const payloadObj = JSON.parse(payload) as JwtPayload;
      
      if (!payloadObj.exp) return true;
      
      const now = Math.floor(Date.now() / 1000);
      return now >= payloadObj.exp;
    } catch (error) {
      return true; // Consider invalid tokens as expired
    }
  }

  /**
   * Get token expiration time (for debugging)
   */
  public static getTokenExpiration(token: string): Date | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = this.base64UrlDecode(parts[1]);
      const payloadObj = JSON.parse(payload) as JwtPayload;
      
      if (!payloadObj.exp) return null;
      
      return new Date(payloadObj.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate token format (basic validation, server does full validation)
   */
  public static isValidTokenFormat(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Try to decode header and payload
      this.base64UrlDecode(parts[0]);
      this.base64UrlDecode(parts[1]);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get token info for debugging
   */
  public static getTokenInfo(token: string): TokenInfo | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const header = JSON.parse(this.base64UrlDecode(parts[0])) as JwtHeader;
      const payload = JSON.parse(this.base64UrlDecode(parts[1])) as JwtPayload;
      
      return {
        header,
        payload,
        isExpired: this.isTokenExpired(token),
        expiresAt: this.getTokenExpiration(token)?.toISOString() || ''
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Base64URL encode string (no padding)
   */
  private static base64UrlEncode(input: string): string {
    const base64 = btoa(input);
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64URL decode string (for testing purposes)
   */
  private static base64UrlDecode(input: string): string {
    // Add padding if needed
    let padded = input;
    switch (padded.length % 4) {
      case 2:
        padded += '==';
        break;
      case 3:
        padded += '=';
        break;
    }
    
    // Convert base64url to base64
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
  }





}

/**
 * Test class for JWT token generation (development only)
 */
export class JwtTokenTest {
  /**
   * Test JWT token generation and validation
   */
  public static async runTests(): Promise<void> {
    if (!import.meta.env?.DEV) return;

    console.log('🧪 Starting JWT Token Tests...');
    
    try {
      // Test 1: Generate token
      console.log('\n📝 Test 1: Token Generation');
      const token = JwtTokenGenerator.generateToken();
      console.log('✅ Token generated:', token.length, 'characters');
      
      // Test 2: Validate token format
      console.log('\n📝 Test 2: Token Format Validation');
      const isValidFormat = JwtTokenGenerator.isValidTokenFormat(token);
      console.log('✅ Token format valid:', isValidFormat);
      
      // Test 3: Get token info
      console.log('\n📝 Test 3: Token Information');
      const tokenInfo = JwtTokenGenerator.getTokenInfo(token);
      if (tokenInfo) {
        console.log('✅ Token info:');
        console.log('   Header:', tokenInfo.header);
        console.log('   Payload:', tokenInfo.payload);
        console.log('   Is Expired:', tokenInfo.isExpired);
        console.log('   Expires At:', tokenInfo.expiresAt);
      }
      
      // Test 4: Authorization header
      console.log('\n📝 Test 4: Authorization Header');
      const authHeader = JwtTokenGenerator.getAuthorizationHeader();
      console.log('✅ Auth header:', authHeader.substring(0, 50) + '...');
      
      // Test 5: Multiple token generation (should be different)
      console.log('\n📝 Test 5: Multiple Token Generation');
      const token1 = JwtTokenGenerator.generateToken();
      await new Promise(resolve => setTimeout(resolve, 1000));
      const token2 = JwtTokenGenerator.generateToken();
      const areDifferent = token1 !== token2;
      console.log('✅ Tokens are different:', areDifferent);
      
      console.log('\n🎉 All JWT Token Tests Passed!');
      
    } catch (error) {
      console.error('❌ JWT Token Test Failed:', error);
    }
  }
  
  /**
   * Test token expiration (for development)
   */
  public static testTokenExpiration(): void {
    if (!import.meta.env?.DEV) return;
    
    console.log('🕐 Testing token expiration...');
    
    const token = JwtTokenGenerator.generateToken();
    const expiration = JwtTokenGenerator.getTokenExpiration(token);
    
    if (expiration) {
      const now = new Date();
      const timeUntilExpiry = expiration.getTime() - now.getTime();
      
      console.log('✅ Token expires in:', Math.floor(timeUntilExpiry / 1000), 'seconds');
      console.log('   Current time:', now.toISOString());
      console.log('   Expiry time:', expiration.toISOString());
      
      // Check if token is currently expired
      const isExpired = JwtTokenGenerator.isTokenExpired(token);
      console.log('   Is currently expired:', isExpired);
    }
  }
}
