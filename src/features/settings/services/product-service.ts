import { ApiClient } from '../../../services/network/api-client';
import type { 
  UnitOfMeasure, 
  Category} from '../../../models/product.model';
import type { 
  DiscountOption, 
  CreateDiscountOptionRequest 
} from '../../../models/payment.model';
import type { 
  SubscriptionPlan, 
  CreateSubscriptionPlanRequest 
} from '../../../models/subscription.model';
import type { 
  VersionCheck, 
  VersionCheckResponse, 
  CreateVersionCheckRequest 
} from '../../../models/version.model';

class ProductApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  // ==================== UNIT OF MEASURE ENDPOINTS ====================

  /**
   * Create Unit of Measure
   */
  async createUnitOfMeasure(data: Omit<UnitOfMeasure, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<UnitOfMeasure> {
    const response = await this.apiClient.post<UnitOfMeasure>(
      '/product-service/units-of-measure',
      data
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to create unit of measure');
    }
    
    return response.data;
  }

  /**
   * Search Unit of Measure
   */
  async searchUnitsOfMeasure(name?: string): Promise<UnitOfMeasure[]> {
    const url = name 
      ? `/product-service/units-of-measure/search?name=${encodeURIComponent(name)}`
      : '/product-service/units-of-measure/search';
    
    const response = await this.apiClient.get<UnitOfMeasure[]>(url);
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to search units of measure');
    }
    
    return response.data;
  }

  /**
   * Get all units of measure
   */
  async getAllUnitsOfMeasure(): Promise<UnitOfMeasure[]> {
    return this.searchUnitsOfMeasure();
  }

  /**
   * Update Unit of Measure
   */
  async updateUnitOfMeasure(id: string, data: Partial<Omit<UnitOfMeasure, 'id' | 'createdAt' | 'updatedAt'>>): Promise<UnitOfMeasure> {
    const response = await this.apiClient.put<UnitOfMeasure>(
      `/product-service/units-of-measure/${id}`,
      data
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to update unit of measure');
    }
    
    return response.data;
  }

  // ==================== CATEGORY ENDPOINTS ====================

  /**
   * Create Category
   */
  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const response = await this.apiClient.post<Category>(
      '/product-service/categories',
      data
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to create category');
    }
    
    return response.data;
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<Category[]> {
    const response = await this.apiClient.get<Category[]>(
      '/product-service/categories'
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to get categories');
    }
    
    return response.data;
  }

  /**
   * Update Category
   */
  async updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category> {
    const response = await this.apiClient.put<Category>(
      `/product-service/categories/${id}`,
      data
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to update category');
    }
    
    return response.data;
  }

  // ==================== PAYMENT & SUBSCRIPTION ENDPOINTS ====================

  /**
   * Get Available Discount Options
   */
  async getDiscountOptions(): Promise<DiscountOption[]> {
    const response = await this.apiClient.get<DiscountOption[]>(
      '/payment-service/billing-discounts'
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to get discount options');
    }
    
    return response.data;
  }

  /**
   * Create Discount Option
   */
  async createDiscountOption(data: CreateDiscountOptionRequest): Promise<DiscountOption> {
    const response = await this.apiClient.post<DiscountOption>(
      '/payment-service/billing-discounts',
      data
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to create discount option');
    }
    
    return response.data;
  }

  /**
   * Get Available Subscription Plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await this.apiClient.get<SubscriptionPlan[]>(
      '/payment-service/subscription-plans/available'
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to get subscription plans');
    }
    
    return response.data;
  }

  /**
   * Create Subscription Plan
   */
  async createSubscriptionPlan(data: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    const response = await this.apiClient.post<SubscriptionPlan>(
      '/payment-service/subscription-plans',
      data
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to create subscription plan');
    }
    
    return response.data;
  }

  // ==================== VERSION CHECK ENDPOINTS ====================

  /**
   * Get Latest Version Information (Public endpoint for app version checking)
   */
  async getLatestVersion(): Promise<VersionCheckResponse> {
    const response = await this.apiClient.get<VersionCheckResponse>(
      '/auth/version/check'
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to get latest version information');
    }
    
    return response.data;
  }

  /**
   * Get All Version Checks (for admin management)
   * Note: This would need a different endpoint for CRUD operations
   */
  async getAllVersionChecks(): Promise<VersionCheck[]> {
    // TODO: Replace with actual admin endpoint when available
    const response = await this.apiClient.get<VersionCheck[]>(
      '/admin/version-checks'
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to get version checks');
    }
    
    return response.data;
  }

  /**
   * Create Version Check (Admin endpoint)
   * Note: This would need a different endpoint for CRUD operations
   */
  async createVersionCheck(data: CreateVersionCheckRequest): Promise<VersionCheck> {
    // TODO: Replace with actual admin endpoint when available
    const response = await this.apiClient.post<VersionCheck>(
      '/admin/version-checks',
      data
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to create version check');
    }
    
    return response.data;
  }

  /**
   * Update Version Check (Admin endpoint)
   * Note: This would need a different endpoint for CRUD operations
   */
  async updateVersionCheck(id: string, data: Partial<CreateVersionCheckRequest>): Promise<VersionCheck> {
    // TODO: Replace with actual admin endpoint when available
    const response = await this.apiClient.put<VersionCheck>(
      `/admin/version-checks/${id}`,
      data
    );
    
    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to update version check');
    }
    
    return response.data;
  }

  /**
   * Delete Version Check (Admin endpoint)
   * Note: This would need a different endpoint for CRUD operations
   */
  async deleteVersionCheck(id: string): Promise<void> {
    // TODO: Replace with actual admin endpoint when available
    const response = await this.apiClient.delete<void>(
      `/admin/version-checks/${id}`
    );
    
    if (!response.isSuccessful) {
      throw new Error('Failed to delete version check');
    }
  }
}

// Create singleton instance
const productApiService = new ProductApiService();

// Export API methods for backward compatibility
export const unitOfMeasureApi = {
  create: (data: Omit<UnitOfMeasure, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>) => 
    productApiService.createUnitOfMeasure(data),
  search: (name?: string) => 
    productApiService.searchUnitsOfMeasure(name),
  getAll: () => 
    productApiService.getAllUnitsOfMeasure(),
  update: (id: string, data: Partial<Omit<UnitOfMeasure, 'id' | 'createdAt' | 'updatedAt'>>) => 
    productApiService.updateUnitOfMeasure(id, data),
};

export const categoryApi = {
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => 
    productApiService.createCategory(data),
  getAll: () => 
    productApiService.getAllCategories(),
  update: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => 
    productApiService.updateCategory(id, data),
};

// Payment API methods
export const paymentApi = {
  getDiscountOptions: () => 
    productApiService.getDiscountOptions(),
  createDiscountOption: (data: CreateDiscountOptionRequest) => 
    productApiService.createDiscountOption(data),
};

// Subscription API methods
export const subscriptionApi = {
  getPlans: () => 
    productApiService.getSubscriptionPlans(),
  createPlan: (data: CreateSubscriptionPlanRequest) => 
    productApiService.createSubscriptionPlan(data),
};

// Version Check API methods
export const versionCheckApi = {
  getCurrent: () => 
    productApiService.getLatestVersion(),
  getAll: () => 
    productApiService.getAllVersionChecks(),
  create: (data: CreateVersionCheckRequest) => 
    productApiService.createVersionCheck(data),
  update: (id: string, data: Partial<CreateVersionCheckRequest>) => 
    productApiService.updateVersionCheck(id, data),
  delete: (id: string) => 
    productApiService.deleteVersionCheck(id),
};

// Re-export types for convenience
export type { UnitOfMeasure, Category } from '../../../models/product.model';
export type { DiscountOption } from '../../../models/payment.model';
export type { SubscriptionPlan } from '../../../models/subscription.model';
export type { VersionCheck, VersionCheckResponse } from '../../../models/version.model';

export default productApiService;
