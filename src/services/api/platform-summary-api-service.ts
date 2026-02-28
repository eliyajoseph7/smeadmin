import { ApiClient } from '../network/api-client';
import type { PlatformSummary } from '../../types/platform-summary';

export class PlatformSummaryApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Get platform summary statistics
   * GET /admin/platform/summary
   */
  async getPlatformSummary(): Promise<PlatformSummary> {
    const response = await this.apiClient.get<PlatformSummary>(
      '/admin/platform/summary'
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch platform summary');
    }

    return response.data;
  }
}

// Export singleton instance
export const platformSummaryService = new PlatformSummaryApiService();
