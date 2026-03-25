export type SubscriptionStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';

export interface Subscription {
  id: string;
  customerId: string;
  subscriptionCode: string;
  status: SubscriptionStatus;
  planName: string | null;
  pricePaid: number | null;
  currency: string;
  mobileNumber: string | null;
  startDate: string | null;
  endDate: string | null;
  activationDate: string | null;
  cancellationDate: string | null;
  cancellationReason: string | null;
  autoRenew: boolean;
  renewalCount: number;
  lastPaymentDate: string | null;
  nextBillingDate: string | null;
  createdAt: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
}

export interface SubscriptionListResponse {
  content: Subscription[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  search?: string;
  page?: number;
  size?: number;
}

export interface SubscriptionPlan {
  id: string;
  planName: string;
  planCode: string;
  description?: string;
  planType: string;
  price: number;
  effectivePrice?: number;
  currency: string;
  durationDays: number;
  features?: string[];
  maxStores?: number;
  maxProducts?: number;
  maxUsers?: number;
  hasAnalytics?: boolean;
  hasApiAccess?: boolean;
  hasPrioritySupport?: boolean;
  status?: string;
  displayOrder?: number;
  isPopular?: boolean;
  discountPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivateSubscriptionRequest {
  customerId: string;
  planId: string;
  durationDays: number;
  notes?: string;
}

export interface ActivateSubscriptionResponse {
  response_code: number;
  response_status: string;
  message: string;
  response_body: {
    id: string;
    customerId: string;
    subscriptionPlan: SubscriptionPlan;
    subscriptionCode: string;
    status: SubscriptionStatus;
    startDate: string;
    endDate: string;
    activationDate: string;
    pricePaid: number;
    autoRenew: boolean;
    renewalCount: number;
    isActive: boolean;
    daysRemaining: number;
  };
}

export type SubscriptionDuration = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY';

export const DURATION_DAYS: Record<SubscriptionDuration, number> = {
  MONTHLY: 30,
  QUARTERLY: 90,
  SEMI_ANNUALLY: 180,
  ANNUALLY: 365
};

export const DURATION_LABELS: Record<SubscriptionDuration, string> = {
  MONTHLY: 'Monthly (30 days)',
  QUARTERLY: 'Quarterly (90 days)',
  SEMI_ANNUALLY: 'Semi-Annually (180 days)',
  ANNUALLY: 'Annually (365 days)'
};
