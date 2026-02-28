export interface SubscriptionStats {
  activeSubscriptions: number;
  pendingSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  trialSubscriptions: number;
  totalSubscriptions: number;
}

export interface RevenueStats {
  totalPaymentsCount: number;
  todayPaymentsCount: number;
  totalPaymentsCollected: number;
  todayPaymentsCollected: number;
  currency: string;
}

export interface SmsExpenses {
  totalSmsSent: number;
  todaySmsSent: number;
  costPerSms: number;
  totalSmsCost: number;
  currency: string;
}

export interface PlatformSummary {
  totalRegisteredOwners: number;
  totalStores: number;
  activeStores: number;
  subscriptionStats: SubscriptionStats;
  totalProducts: number;
  totalStaff: number;
  revenueStats: RevenueStats;
  smsExpenses: SmsExpenses;
}

export interface PlatformSummaryResponse {
  success: boolean;
  message: string;
  data: PlatformSummary;
}
