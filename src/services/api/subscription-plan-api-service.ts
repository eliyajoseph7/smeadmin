import { ApiClient } from '../network/api-client';
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  SubscriptionPlanResponse,
  PlanStatus
} from '../../models/subscription.model';

export class SubscriptionPlanApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Get all subscription plans with optional filtering
   * GET /api/v1/payment-service/subscription-plans
   */
  async getAllPlans(options?: {
    status?: PlanStatus;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<SubscriptionPlan[]> {
    const params = new URLSearchParams();
    
    if (options?.status) {
      params.append('status', options.status);
    }
    if (options?.page !== undefined) {
      params.append('page', options.page.toString());
    }
    if (options?.size !== undefined) {
      params.append('size', options.size.toString());
    }
    if (options?.sortBy) {
      params.append('sortBy', options.sortBy);
    }
    if (options?.sortDir) {
      params.append('sortDir', options.sortDir);
    }

    const queryString = params.toString();
    const url = `/payment-service/subscription-plans${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.apiClient.get<{content: SubscriptionPlan[]}>(url);
    return response.data.content;
  }

  /**
   * Create a new subscription plan
   * POST /api/v1/payment-service/subscription-plans
   */
  async createPlan(planData: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    const response = await this.apiClient.post<SubscriptionPlanResponse>(
      '/payment-service/subscription-plans',
      planData
    );
    return response.data.body!;
  }

  /**
   * Update an existing subscription plan
   * PUT /api/v1/payment-service/subscription-plans/{planId}
   */
  async updatePlan(planId: string, updateData: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    const response = await this.apiClient.put<SubscriptionPlanResponse>(
      `/payment-service/subscription-plans/${planId}`,
      updateData
    );
    return response.data.body!;
  }

  /**
   * Delete (archive) a subscription plan
   * DELETE /api/v1/payment-service/subscription-plans/{planId}
   */
  async deletePlan(planId: string): Promise<void> {
    await this.apiClient.delete<SubscriptionPlanResponse>(
      `/payment-service/subscription-plans/${planId}`
    );
  }

  /**
   * Update plan status only
   * PATCH /api/v1/payment-service/subscription-plans/{planId}/status?status={status}
   */
  async updatePlanStatus(planId: string, status: PlanStatus): Promise<SubscriptionPlan> {
    const response = await this.apiClient.put<SubscriptionPlanResponse>(
      `/payment-service/subscription-plans/${planId}/status?status=${status}`
    );
    return response.data.body!;
  }
}
