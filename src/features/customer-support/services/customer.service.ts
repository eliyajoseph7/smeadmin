import axios from 'axios';
import type { Customer, ApiResponse } from '../types/customer';
import type { 
  StoreUsersResponse, 
  ProductsResponse, 
  PurchasePlansResponse, 
  SalesResponse, 
  ExpensesResponse,
  PaymentsResponse 
} from '../types/store';
import { ApiClient } from '../../../services/network/api-client';

const API_BASE_URL = ApiClient.getInstance().baseUrl;

class CustomerService {
  async searchByPhone(phoneNumber: string): Promise<Customer | null> {
    try {
      const response = await axios.get<ApiResponse<Customer>>(
        `${API_BASE_URL}/auth/user-details/${encodeURIComponent(phoneNumber)}`
      );
      
      if (response.data.response_code === 200 && response.data.response_body) {
        return response.data.response_body;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching customer details:', error);
      return null;
    }
  }

  async getStoreDetails(storeId: string): Promise<StoreUsersResponse | null> {
    try {
      const response = await axios.get<ApiResponse<StoreUsersResponse>>(
        `${API_BASE_URL}/auth/stores/${storeId}`
      );
      
      if (response.data.response_code === 200 && response.data.response_body) {
        return response.data.response_body;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching store details:', error);
      return null;
    }
  }

  async getStoreUsers(storeId: string): Promise<StoreUsersResponse | null> {
    try {
      const response = await axios.get<ApiResponse<StoreUsersResponse>>(
        `${API_BASE_URL}/auth/stores/${storeId}/users`
      );
      
      if (response.data.response_code === 200 && response.data.response_body) {
        return response.data.response_body;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching store users:', error);
      return null;
    }
  }

  async getStoreProducts(storeId: string, page: number = 0, size: number = 20): Promise<ProductsResponse | null> {
    try {
      const response = await axios.get<ApiResponse<ProductsResponse>>(
        `${API_BASE_URL}/product-service/products/store/${storeId}?page=${page}&size=${size}`
      );
      
      if (response.data.response_code === 200 && response.data.response_body) {
        return response.data.response_body;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching store products:', error);
      return null;
    }
  }

  async getStorePurchasePlans(storeId: string, page: number = 0, size: number = 20): Promise<PurchasePlansResponse | null> {
    try {
      const response = await axios.get<ApiResponse<PurchasePlansResponse>>(
        `${API_BASE_URL}/purchase-service/purchase-plans?storeId=${storeId}&page=${page}&size=${size}`
      );
      
      if (response.data.response_code === 200 && response.data.response_body) {
        return response.data.response_body;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching purchase plans:', error);
      return null;
    }
  }

  async getStoreSales(storeId: string, saleType: 'QUOTATION' | 'DIRECT' = 'DIRECT', page: number = 0, size: number = 20): Promise<SalesResponse | null> {
    try {
      const response = await axios.get<ApiResponse<SalesResponse>>(
        `${API_BASE_URL}/sale-service/sales/store/${storeId}?saleType=${saleType}&page=${page}&size=${size}`
      );
      
      if (response.data.response_code === 200 && response.data.response_body) {
        return response.data.response_body;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching store sales:', error);
      return null;
    }
  }

  async getStoreExpenses(storeId: string): Promise<ExpensesResponse | null> {
    try {
      const response = await axios.get<ApiResponse<ExpensesResponse>>(
        `${API_BASE_URL}/purchase-service/expenses?storeId=${storeId}`
      );
      
      if (response.data.response_code === 200 && response.data.response_body) {
        return response.data.response_body;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching store expenses:', error);
      return null;
    }
  }

  async getUserPayments(userId: string): Promise<PaymentsResponse | null> {
    try {
      const response = await axios.get<PaymentsResponse>(
        `${API_BASE_URL}/payment-service/payments/user/${userId}/all`
      );
      
      if (response.data.response_code === 200 && response.data.response_body) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user payments:', error);
      return null;
    }
  }
}

export const customerService = new CustomerService();
