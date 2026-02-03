import { ApiClient } from '../../../services/network/api-client';
import type {
  Admin,
  CreateAdminRequest,
  UpdateAdminRequest,
  UpdateAdminStatusRequest,
  ChangePasswordRequest,
  ApiResponse,
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

    const response = await this.apiClient.get<ApiResponse<Admin[]>>(endpoint);

    if (!response.isSuccessful || !response.data?.response_body) {
      throw new Error('Failed to fetch admins');
    }

    return response.data.response_body;
  }

  /**
   * Get Admin by ID
   */
  async getAdminById(id: string): Promise<Admin> {
    const response = await this.apiClient.get<ApiResponse<Admin>>(
      `/admin/admins/${id}`
    );

    if (!response.isSuccessful || !response.data?.response_body) {
      throw new Error('Failed to fetch admin details');
    }

    return response.data.response_body;
  }

  /**
   * Create Admin User
   */
  async createAdmin(data: CreateAdminRequest): Promise<Admin> {
    const response = await this.apiClient.post<ApiResponse<Admin>>(
      '/admin/admins',
      data
    );

    if (!response.isSuccessful || !response.data?.response_body) {
      throw new Error(response.data?.message || 'Failed to create admin');
    }

    return response.data.response_body;
  }

  /**
   * Update Admin User
   */
  async updateAdmin(id: string, data: UpdateAdminRequest): Promise<Admin> {
    const response = await this.apiClient.put<ApiResponse<Admin>>(
      `/admin/admins/${id}`,
      data
    );

    if (!response.isSuccessful || !response.data?.response_body) {
      throw new Error(response.data?.message || 'Failed to update admin');
    }

    return response.data.response_body;
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
