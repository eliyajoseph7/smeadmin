import type { BaseEntity } from './common.model';

// Billing Cycle Types
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';

// Discount Options Model
export interface DiscountOption extends BaseEntity {
  billingCycle: BillingCycle;
  discountPercentage: number;
  durationMonths: number;
  isActive: boolean;
  description: string;
  displayOrder: number;
  billingCycleDescription: string;
}

export interface CreateDiscountOptionRequest {
  billingCycle: BillingCycle;
  discountPercentage: number;
  durationMonths: number;
  description: string;
  displayOrder: number;
  isActive?: boolean;
}

export interface UpdateDiscountOptionRequest extends Partial<CreateDiscountOptionRequest> {
  id: string;
}
