import { ApiClient } from '../network/api-client';
import type {
  BillingDiscount,
  CreateBillingDiscountRequest,
  UpdateBillingDiscountRequest,
  BillingDiscountResponse,
  BillingDiscountsListResponse,
  DeleteBillingDiscountResponse
} from '../../models/billing-discount.model';

export class BillingDiscountApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Get all active billing discount configurations
   * GET /api/v1/payment-service/billing-discounts
   */
  async getActiveDiscounts(): Promise<BillingDiscount[]> {
    const response = await this.apiClient.get<BillingDiscountsListResponse>(
      '/payment-service/billing-discounts'
    );
    return response.data.response_body;
  }

  /**
   * Get all billing discount configurations (including inactive)
   * GET /api/v1/payment-service/billing-discounts/all
   */
  async getAllDiscounts(): Promise<BillingDiscount[]> {
    const response = await this.apiClient.get<BillingDiscountsListResponse>(
      '/payment-service/billing-discounts/all'
    );
    return response.data.response_body;
  }

  /**
   * Create or update discount configuration
   * POST /api/v1/payment-service/billing-discounts
   */
  async createOrUpdateDiscount(discountData: CreateBillingDiscountRequest): Promise<BillingDiscount> {
    const response = await this.apiClient.post<BillingDiscountResponse>(
      '/payment-service/billing-discounts',
      discountData
    );
    return response.data.response_body!;
  }

  /**
   * Update discount configuration by ID
   * PUT /api/v1/payment-service/billing-discounts/id/{discountId}
   */
  async updateDiscountById(discountId: string, updateData: UpdateBillingDiscountRequest): Promise<BillingDiscount> {
    const response = await this.apiClient.put<BillingDiscountResponse>(
      `/payment-service/billing-discounts/id/${discountId}`,
      updateData
    );
    return response.data.response_body!;
  }

  /**
   * Delete discount configuration
   * DELETE /api/v1/payment-service/billing-discounts/{discountId}
   */
  async deleteDiscount(discountId: string): Promise<void> {
    await this.apiClient.delete<DeleteBillingDiscountResponse>(
      `/payment-service/billing-discounts/${discountId}`
    );
  }
}
