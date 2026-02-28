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
  totalPaymentsCollected: number;
  totalRevenue: number;
  totalProfit: number;
  currency: string;
}

export interface Owner {
  ownerId: string;
  phoneNumber: string;
  email: string;
  fullName: string;
  registeredAt: string;
  webActivated: boolean;
  totalStores: number;
  activeStores: number;
  subscription: Subscription;
  totalStaff: number;
  totalProducts: number;
  sales: Sales;
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
}
