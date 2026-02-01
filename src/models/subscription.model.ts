import type { BaseEntity } from './common.model';

// Plan Types
export type PlanType = 'TRIAL' | 'BASIC' | 'STANDARD' | 'PREMIUM';

// Billing Cycles
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

// Plan Status
export type PlanStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

// Subscription Plan Model
export interface SubscriptionPlan extends BaseEntity {
  planCode: string;
  planName: string;
  description: string;
  planType: PlanType;
  price: number;
  effectivePrice?: number;
  currency: string;
  durationDays: number;
  billingCycle?: BillingCycle; // Optional since not always present in API response
  features: string[];
  maxStores: number;
  maxProducts: number;
  maxUsers: number;
  hasAnalytics: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
  status: PlanStatus;
  displayOrder: number;
  isPopular: boolean;
  discountPercentage?: number;
  trialDays?: number;
}

export interface CreateSubscriptionPlanRequest {
  planCode: string;
  planName: string;
  description: string;
  planType: PlanType;
  price: number;
  currency: string;
  durationDays: number;
  billingCycle: BillingCycle;
  features: string[];
  maxStores: number;
  maxProducts: number;
  maxUsers: number;
  hasAnalytics: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
  displayOrder: number;
  isPopular?: boolean;
  discountPercentage?: number;
  trialDays?: number;
}

export interface UpdateSubscriptionPlanRequest {
  planName?: string;
  description?: string;
  price?: number;
  durationDays?: number;
  features?: string[];
  maxStores?: number;
  maxProducts?: number;
  maxUsers?: number;
  hasAnalytics?: boolean;
  hasApiAccess?: boolean;
  hasPrioritySupport?: boolean;
  discountPercentage?: number;
}

// Status update request
export interface UpdatePlanStatusRequest {
  status: PlanStatus;
}

// API Response types
export interface SubscriptionPlanResponse {
  response_code: number;
  response_status: string;
  message: string;
  body?: SubscriptionPlan;
}

export interface SubscriptionPlansListResponse {
  response_code: number;
  response_status: string;
  message: string;
  timestamp: string;
  response_body: {
    content: SubscriptionPlan[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  };
}
