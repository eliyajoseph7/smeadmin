import { ApiClient } from '../network/api-client';
import type { Subscription, SubscriptionListResponse, SubscriptionFilters } from '../../types/subscription';

class SubscriptionApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Get paginated list of subscriptions
   */
  async getSubscriptions(filters?: SubscriptionFilters): Promise<SubscriptionListResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page !== undefined) params.append('page', filters.page.toString());
    if (filters?.size !== undefined) params.append('size', filters.size.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/subscriptions?${queryString}` : '/admin/subscriptions';

    const response = await this.apiClient.get<any>(endpoint);

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch subscriptions');
    }

    // Handle both wrapped and unwrapped responses
    const apiData = response.data.response_body || response.data;
    
    if (!apiData) {
      throw new Error('Invalid API response structure');
    }

    return apiData;
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string): Promise<Subscription> {
    const response = await this.apiClient.get<any>(
      `/admin/subscriptions/${id}`
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch subscription details');
    }

    const apiData = response.data.response_body || response.data;
    
    if (!apiData) {
      throw new Error('Invalid API response structure');
    }

    return apiData;
  }
}

export const subscriptionApiService = new SubscriptionApiService();
