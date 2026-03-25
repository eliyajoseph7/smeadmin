import { ApiClient } from '../network/api-client';
import type { 
  Subscription, 
  SubscriptionListResponse, 
  SubscriptionFilters,
  SubscriptionPlan,
  ActivateSubscriptionRequest,
  ActivateSubscriptionResponse
} from '../../types/subscription';

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

  /**
   * Get all subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await this.apiClient.get<any>(
      '/payment-service/subscription-plans'
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch subscription plans');
    }

    const apiData = response.data.response_body || response.data;
    
    if (!apiData) {
      throw new Error('Invalid API response structure');
    }

    // Handle paginated response - plans are in content array
    if (apiData.content && Array.isArray(apiData.content)) {
      return apiData.content;
    }

    // Handle direct array response
    return Array.isArray(apiData) ? apiData : [];
  }

  /**
   * Admin endpoint to manually activate a subscription
   * POST /payment-service/subscriptions/admin/activate
   */
  async activateSubscription(request: ActivateSubscriptionRequest): Promise<ActivateSubscriptionResponse> {
    const response = await this.apiClient.post<any>(
      '/payment-service/subscriptions/admin/activate',
      request
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to activate subscription');
    }

    // Return the full response which includes message, response_code, response_status, and response_body
    return {
      response_code: response.data.response_code,
      response_status: response.data.response_status,
      message: response.data.message,
      response_body: response.data.response_body
    };
  }
}

export const subscriptionApiService = new SubscriptionApiService();
