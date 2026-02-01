import type { BaseEntity } from './common.model';

// Billing Cycle Types (reusing from subscription model)
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

// Billing Discount Model
export interface BillingDiscount extends BaseEntity {
  billingCycle: BillingCycle;
  discountPercentage: number;
  durationMonths: number;
  isActive: boolean;
  description: string;
}

// Create/Update Request
export interface CreateBillingDiscountRequest {
  billingCycle: BillingCycle;
  discountPercentage: number;
  durationMonths: number;
  isActive: boolean;
  description: string;
}

export interface UpdateBillingDiscountRequest {
  billingCycle?: BillingCycle;
  discountPercentage?: number;
  durationMonths?: number;
  isActive?: boolean;
  description?: string;
}

// API Response types
export interface BillingDiscountResponse {
  response_code: number;
  response_status: string;
  message: string;
  response_body?: BillingDiscount;
}

export interface BillingDiscountsListResponse {
  response_code: number;
  response_status: string;
  message: string;
  response_body: BillingDiscount[];
}

// Delete Response
export interface DeleteBillingDiscountResponse {
  response_code: number;
  response_status: string;
  message: string;
}
