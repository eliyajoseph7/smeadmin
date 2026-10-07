export interface Subscription {
  status: string;
  planName: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  renewalCount: number;
}

export interface Sales {
  totalSalesCount: number;
  lastSaleDate?: string | null;
  totalPaymentsCollected?: number;
  totalRevenue?: number;
  totalProfit?: number;
  currency?: string;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
}

export interface PurchaseStats {
  totalPurchases: number;
}

export interface Owner {
  ownerId: string;
  phoneNumber: string;
  email: string;
  fullName: string;
  source?: string;
  registeredAt: string;
  webActivated: boolean;
  totalStores: number;
  activeStores: number;
  subscription: Subscription | null;
  totalStaff: number;
  productStats: ProductStats;
  sales: Sales;
  purchases?: PurchaseStats;
}

export interface OwnersResponse {
  content: Owner[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
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
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface OwnersApiResponse {
  success: boolean;
  message: string;
  data: OwnersResponse;
}

export interface OwnersQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  query?: string;
  name?: string;
  phoneNumber?: string;
  source?: string;
  type?: string;
  sources?: string[];
  expiredPlan?: boolean | string;
  webActivated?: boolean | string;
  registeredFrom?: string;
  registeredTo?: string;
  minStores?: number | string;
  maxStores?: number | string;
  minActiveStores?: number | string;
  maxActiveStores?: number | string;
  minProducts?: number | string;
  maxProducts?: number | string;
  minActiveProducts?: number | string;
  maxActiveProducts?: number | string;
  minSales?: number | string;
  maxSales?: number | string;
  minStaff?: number | string;
  maxStaff?: number | string;
  minPurchases?: number | string;
  maxPurchases?: number | string;
}
