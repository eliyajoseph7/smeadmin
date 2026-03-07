import { ApiClient } from '../../../services/network/api-client';
import type {
  Admin,
  CreateAdminRequest,
  UpdateAdminRequest,
  UpdateAdminStatusRequest,
  ChangePasswordRequest,
  SimpleResponse,
  AdminRole,
  AdminStatus
} from '../types/admin';

class AdminManagementService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * List All Admins
   */
  async getAllAdmins(filters?: {
    role?: AdminRole;
    status?: AdminStatus;
  }): Promise<Admin[]> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/admins?${queryString}` : '/admin/admins';

    const response = await this.apiClient.get<any>(endpoint);

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch admins');
    }

    // Handle both wrapped and unwrapped responses
    const apiData = response.data.response_body || response.data;
    
    if (!apiData) {
      throw new Error('Invalid API response structure');
    }

    return apiData;
  }

  /**
   * Get Admin by ID
   */
  async getAdminById(id: string): Promise<Admin> {
    const response = await this.apiClient.get<any>(
      `/admin/admins/${id}`
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch admin details');
    }

    const apiData = response.data.response_body || response.data;
    
    if (!apiData) {
      throw new Error('Invalid API response structure');
    }

    return apiData;
  }

  /**
   * Create Admin User
   */
  async createAdmin(data: CreateAdminRequest): Promise<Admin> {
    const response = await this.apiClient.post<any>(
      '/admin/admins',
      data
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to create admin');
    }

    const apiData = response.data.response_body || response.data;
    
    if (!apiData) {
      throw new Error('Invalid API response structure');
    }

    return apiData;
  }

  /**
   * Update Admin User
   */
  async updateAdmin(id: string, data: UpdateAdminRequest): Promise<Admin> {
    const response = await this.apiClient.put<any>(
      `/admin/admins/${id}`,
      data
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to update admin');
    }

    const apiData = response.data.response_body || response.data;
    
    if (!apiData) {
      throw new Error('Invalid API response structure');
    }

    return apiData;
  }

  /**
   * Update Admin Status
   */
  async updateAdminStatus(id: string, data: UpdateAdminStatusRequest): Promise<void> {
    const response = await this.apiClient.patch<SimpleResponse>(
      `/admin/admins/${id}/status`,
      data
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error(response.data?.message || 'Failed to update admin status');
    }
  }

  /**
   * Change Admin Password
   */
  async changeAdminPassword(id: string, data: ChangePasswordRequest): Promise<void> {
    const response = await this.apiClient.post<SimpleResponse>(
      `/admin/admins/${id}/change-password`,
      data
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error(response.data?.message || 'Failed to change password');
    }
  }

  /**
   * Delete Admin User
   */
  async deleteAdmin(id: string): Promise<void> {
    const response = await this.apiClient.delete<SimpleResponse>(
      `/admin/admins/${id}`
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error(response.data?.message || 'Failed to delete admin');
    }
  }
}

export const adminManagementService = new AdminManagementService();
