import { ApiClient } from '../network/api-client';
import type {
  AppVersion,
  AppVersionCheckResponse,
  CreateAppVersionRequest,
  UpdateAppVersionRequest,
  VersionHistoryResponse,
  DeleteVersionResponse
} from '../../models/app-version';

export class AppVersionApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Check for app updates for a specific version
   * GET /api/v1/auth/version/check/{version}
   */
  async checkForUpdates(): Promise<AppVersionCheckResponse> {
    const response = await this.apiClient.get<AppVersionCheckResponse>(
      `/auth/version/check`
    );
    return response.data;
  }

  /**
   * Create a new app version or update existing one
   * POST /api/v1/auth/version
   */
  async createVersion(versionData: CreateAppVersionRequest): Promise<AppVersion> {
    const response = await this.apiClient.post<AppVersion>(
      '/auth/version',
      versionData
    );
    return response.data;
  }

  /**
   * Update an existing app version by version string
   * PUT /api/v1/auth/version/{version}
   */
  async updateVersion(version: string, updateData: UpdateAppVersionRequest): Promise<AppVersion> {
    const response = await this.apiClient.put<AppVersion>(
      `/auth/version/${version}`,
      updateData
    );
    return response.data;
  }

  /**
   * Delete an app version by version string
   * DELETE /api/v1/auth/version/{version}
   */
  async deleteVersion(version: string): Promise<DeleteVersionResponse> {
    const response = await this.apiClient.delete<DeleteVersionResponse>(
      `/auth/version/${version}`
    );
    return response.data;
  }

  /**
   * Get version history with pagination
   * GET /api/v1/auth/version/history?page={page}&size={size}
   */
  async getVersionHistory(page: number = 0, size: number = 10): Promise<VersionHistoryResponse> {
    const response = await this.apiClient.get<VersionHistoryResponse>(
      `/auth/version/history?page=${page}&size=${size}`
    );
    return response.data;
  }
}
