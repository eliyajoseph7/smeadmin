export interface ApiResponse<T> {
  response_code: number;
  response_status: string;
  response_body: T;
  timestamp: string;
  message: string;
}

export interface Customer {
  user_id: string;
  phone_number: string;
  email: string;
  business_name: string;
  number_of_stores: number;
  phone_verified: boolean;
  web_activated: boolean;
  created_at: string;
  stores: CustomerStore[];
  subscription: Subscription;
}

export interface CustomerStore {
  store_id: string;
  store_number: number;
  store_name: string;
  store_location: string;
  staff_phone_number: string | null;
  store_description: string;
  created_at: string;
  role: string;
}

export interface Subscription {
  subscription_id: string;
  plan_id: string;
  plan_code: string;
  plan_name: string;
  plan_type: string;
  price: number;
  effective_price: number;
  currency: string;
  duration_days: number;
  features: string[];
  max_stores: number;
  max_products: number;
  max_users: number;
  subscription_status: string;
  subscription_start_date: string;
  subscription_end_date: string;
  auto_renew: boolean;
}

export interface StoreDetails {
  id: string;
  name: string;
  category: string;
  location: string;
  owner: {
    id: string;
    name: string;
    phoneNumber: string;
    email: string;
  };
  registrationDate: string;
  status: 'active' | 'inactive' | 'pending';
  statistics: {
    totalSales: number;
    totalPurchases: number;
    totalRevenue: number;
    totalOrders: number;
    inventoryValue: number;
    inventoryItems: number;
  };
  recentSales: SaleTransaction[];
  recentPurchases: PurchaseTransaction[];
  inventory: InventoryItem[];
}

export interface SaleTransaction {
  id: string;
  date: string;
  customerName: string;
  items: number;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface PurchaseTransaction {
  id: string;
  date: string;
  supplier: string;
  items: number;
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  status: 'completed' | 'pending' | 'cancelled';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  reorderLevel: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}
