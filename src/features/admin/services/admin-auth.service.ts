import { ApiClient } from '../../../services/network/api-client';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SimpleResponse
} from '../types/admin';

class AdminAuthService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Admin Login
   */
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await this.apiClient.post<AdminLoginResponse>(
      '/admin/auth/login',
      credentials
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error(response.data?.message || 'Login failed');
    }

    return response.data;
  }

  /**
   * Refresh Token
   */
  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await this.apiClient.post<RefreshTokenResponse>(
      '/admin/auth/refresh',
      request
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error(response.data?.message || 'Token refresh failed');
    }

    return response.data;
  }

  /**
   * Admin Logout
   */
  async logout(): Promise<SimpleResponse> {
    const response = await this.apiClient.post<SimpleResponse>(
      '/admin/auth/logout',
      {}
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error(response.data?.message || 'Logout failed');
    }

    return response.data;
  }
}

export const adminAuthService = new AdminAuthService();
