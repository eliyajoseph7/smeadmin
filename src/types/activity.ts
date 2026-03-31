export type ActivityType = 
  | 'SALE' 
  | 'SALE_DRAFT'
  | 'SALE_CANCELLED'
  | 'PURCHASE' 
  | 'PURCHASE_DRAFT'
  | 'PURCHASE_CANCELLED'
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'STOCK_ADJUSTMENT';

export interface Activity {
  activityId: string;
  activityType: ActivityType;
  description: string;
  storeId: string;
  storeName: string;
  userId: string;
  userName: string;
  entityType: string;
  entityId: string;
  entityReference: string;
  amount: number | null;
  timestamp: string;
  serviceName: string;
}

export interface ActivitySummary {
  totalActivities: number;
  totalSales: number;
  totalPurchases: number;
  totalProductUpdates: number;
  activeUsersCount: number;
  activeStoresCount: number;
  periodStart: string;
  periodEnd: string;
}

export interface ActiveUser {
  userId: string;
  userName: string;
  phoneNumber: string;
  storeId: string;
  storeName: string;
  activityCount: number;
  lastActivityTime: string;
  lastActivityType: ActivityType;
  serviceName: string;
}

export interface ActivityResponse {
  summary: ActivitySummary;
  activities: Activity[];
  activeUsers: ActiveUser[];
}

export interface ActivityApiResponse {
  status_code: number;
  message: string;
  response_body: ActivityResponse;
}

export interface ActivityQueryParams {
  startTime?: string;
  endTime?: string;
  limit?: number;
}

export interface ActiveUsersPerServiceResponse {
  'sale-service': number;
  'purchase-service': number;
  'product-service': number;
}

export interface ActiveUsersApiResponse {
  status_code: number;
  message: string;
  response_body: ActiveUsersPerServiceResponse;
}
