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
