import { ApiClient } from '../network/api-client';
import type { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse, 
  LogoutResponse} from '../../types/auth';

export class AuthApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Admin login
   * POST /admin/auth/login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.apiClient.post<any>(
        '/admin/auth/login',
        credentials
      );

      if (!response.isSuccessful || !response.data) {
        throw new Error('Login failed');
      }

      // The ApiClient wraps the response, so response.data is your actual API response
      const apiData = response.data.response_body || response.data;
      
      if (!apiData || !apiData.accessToken) {
        throw new Error('Invalid API response structure');
      }
      
      const mappedResponse: LoginResponse = {
        success: true,
        message: response.data.message || 'Login successful',
        data: {
          accessToken: apiData.accessToken,
          refreshToken: apiData.refreshToken,
          tokenType: apiData.tokenType,
          expiresIn: apiData.expiresIn,
          admin: {
            id: apiData.adminUserId,
            email: apiData.email,
            fullName: apiData.fullName,
            role: apiData.role,
            status: 'ACTIVE' // Default since not provided by API
          }
        }
      };

      return mappedResponse;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 423) {
        throw new Error('Account locked due to failed attempts');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  }

  /**
   * Refresh access token
   * POST /admin/auth/refresh
   */
  async refreshToken(refreshTokenRequest: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      const response = await this.apiClient.post<RefreshTokenResponse['data']>(
        '/admin/auth/refresh',
        refreshTokenRequest
      );

      if (!response.isSuccessful || !response.data) {
        throw new Error('Token refresh failed');
      }

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: response.data
      };
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Token refresh failed. Please login again.');
      }
    }
  }

  /**
   * Admin logout
   * POST /admin/auth/logout
   */
  async logout(): Promise<LogoutResponse> {
    try {
      await this.apiClient.post<void>('/admin/auth/logout', {});

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error: any) {
      // Even if logout fails on server, we should still clear local tokens
      console.warn('Logout request failed, but clearing local session:', error);
      return {
        success: true,
        message: 'Logout successful'
      };
    }
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();
