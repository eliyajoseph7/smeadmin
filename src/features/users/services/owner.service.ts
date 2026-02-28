import type { Owner, OwnersQueryParams, OwnersResponse } from '../types/owner';
import { ApiClient, type ApiResponse } from '../../../services/network/api-client';

export class OwnersApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Get paginated list of owners
   * GET /api/v1/admin/platform/owners
   */
  async getOwners(params: OwnersQueryParams = {}): Promise<ApiResponse<OwnersResponse>> {
    const queryParams = new URLSearchParams();
    
    // Set default values
    const finalParams = {
      page: 0,
      size: 20,
      sortBy: 'createdAt',
      sortDir: 'desc' as const,
      ...params
    };

    Object.entries(finalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await this.apiClient.get<OwnersResponse>(
      `/admin/platform/owners?${queryParams.toString()}`
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch owners');
    }
    return response;
  }

  /**
   * Get owner by ID
   * GET /api/v1/admin/platform/owners/{ownerId}
   */
  async getOwnerById(ownerId: string): Promise<Owner> {
    const response = await this.apiClient.get<Owner>(
      `/admin/platform/owners/${ownerId}`
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch owner');
    }
    
    return response.data;
  }
}
