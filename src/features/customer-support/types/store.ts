export interface StoreUsersResponse {
  store_id: string;
  store_number: number;
  store_name: string;
  store_code: string;
  store_location: string;
  staff_phone_number: string | null;
  store_description: string;
  created_at: string;
  total_users: number;
  is_active?: boolean;
  users: StoreUser[];
}

export interface StoreUser {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface ProductsResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface StockDetails {
  id: string;
  productId: string;
  quantity: number;
  minAlert?: number;
  isInStock: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
  lastUpdatedAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  productCode: string;
  productName: string;
  productDescription: string;
  brand: string;
  unitOfMeasureId: string;
  sellingPrice: number;
  costPrice: number;
  reorderLevel?: number;
  isTrackedInventory: boolean;
  isFeatured: boolean;
  isActive: boolean;
  stockDetails: StockDetails;
  createdAt: string;
  updatedAt: string;
}

export interface PurchasePlansResponse {
  content: PurchasePlan[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PurchasePlan {
  purchasePlanId: string;
  planName: string;
  supplierName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: PurchasePlanItem[];
}

export interface PurchasePlanItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesResponse {
  content: Sale[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Sale {
  saleId: string;
  saleNumber: string;
  customerName?: string;
  customerPhone?: string;
  saleType: 'DIRECT' | 'QUOTATION';
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  saleStatus: string;
  createdAt: string;
  items: SaleItem[];
}

export interface SaleItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ExpensesResponse {
  items: Expense[];
  total: number;
}

export interface Expense {
  id: string;
  storeId: string;
  expenseNumber: string;
  amount: number;
  category: string;
  description: string;
  notes?: string;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PaymentsResponse {
  response_code: number;
  response_status: string;
  response_body: Payment[];
  timestamp: string;
  message: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  subscriptionCode: string;
  planName: string;
  paymentReference: string;
  externalReference?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'PROCESSING' | 'FAILED' | 'COMPLETED' | 'PENDING';
  mobileNumber: string;
  providerName?: string;
  initiatedAt: string;
  completedAt?: string;
  failedAt?: string;
  expiresAt: string;
  description: string;
  failureReason?: string;
}
