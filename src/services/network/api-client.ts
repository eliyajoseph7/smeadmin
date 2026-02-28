// API Client matching smeweb structure
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { JwtTokenGenerator } from '../auth/jwt-token-generator';
import { API_CONFIG } from '../../config/api';

export interface ApiResponse<T> {
  statusCode: number;
  headers: Record<string, string>;
  data: T;
  isSuccessful: boolean;
}

export interface ApiEnvelope<T> {
  responseCode: number;
  responseStatus: string;
  message: string;
  body: T;
}

export type AuthTokenProvider = () => Promise<string | null>;
export type DeviceIdProvider = () => Promise<string | null>;
export type AppVersionProvider = () => Promise<string | null>;

export class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  public baseUrl = import.meta.env.DEV ? '/api/v1' : API_CONFIG.BASE_URL_WITH_VERSION;
  private timeout = 20000; // 20 seconds
  // private authTokenProvider?: AuthTokenProvider;
  private deviceIdProvider?: DeviceIdProvider;
  private appVersionProvider?: AppVersionProvider;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public configure(config: {
    baseUrl?: string;
    timeout?: number;
    authTokenProvider?: AuthTokenProvider;
    deviceIdProvider?: DeviceIdProvider;
    appVersionProvider?: AppVersionProvider;
  }) {
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl.endsWith('/') 
        ? config.baseUrl.slice(0, -1) 
        : config.baseUrl;
      this.axiosInstance.defaults.baseURL = this.baseUrl;
    }
    
    if (config.timeout) {
      this.timeout = config.timeout;
      this.axiosInstance.defaults.timeout = this.timeout;
    }

    // this.authTokenProvider = config.authTokenProvider;
    this.deviceIdProvider = config.deviceIdProvider;
    this.appVersionProvider = config.appVersionProvider;
  }

  private setupInterceptors() {
    // Request interceptor for adding auth headers
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Generate fresh JWT token for each request (expires in 2 minutes)
        try {
          config.headers.Authorization = JwtTokenGenerator.getAuthorizationHeader();
          if (import.meta.env?.DEV) {
                      }
        } catch (error) {
          if (import.meta.env?.DEV) {
            console.error('❌ Failed to generate JWT token:', error);
          }
          // Continue without token - let server handle authentication error
        }

        // Add device ID
        const deviceId = await this.deviceIdProvider?.();
        if (deviceId) {
          config.headers['X-Device-Id'] = deviceId;
        }

        // Add app version
        const appVersion = await this.appVersionProvider?.();
        if (appVersion) {
          config.headers['X-App-Version'] = appVersion;
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling responses
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Check for API-level errors in response body
        if (response.data && typeof response.data === 'object') {
          const { response_code, response_status, message } = response.data;
          
          if (response_code && response_code !== 200 && response_code !== 201) {
            console.error('🔴 API Response Error:', {
              responseCode: response_code,
              responseStatus: response_status,
              message,
            });

            // Convert API response codes to appropriate errors
            const error = new Error(message || 'API Error');
            (error as any).responseCode = response_code;
            (error as any).responseStatus = response_status;
            throw error;
          }
        }

        return response;
      },
      (error) => {
        console.error('🔴 HTTP Request Failed:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        // Handle network errors
        if (!error.response) {
          if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout');
          }
          throw new Error('Network error');
        }

        // Handle HTTP errors
        const { status, data } = error.response;
        let message = 'An error occurred';

        if (data && typeof data === 'object' && data.message) {
          message = data.message;
        } else if (status === 401) {
          message = 'Unauthorized';
        } else if (status === 403) {
          message = 'Forbidden';
        } else if (status === 404) {
          message = 'Not found';
        } else if (status >= 500) {
          message = 'Server error';
        }

        const apiError = new Error(message);
        (apiError as any).status = status;
        (apiError as any).data = data;
        throw apiError;
      }
    );
  }

  public async get<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<T>(path, config);
    return this.transformResponse(response);
  }

  public async post<T>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<T>(path, data, config);
    return this.transformResponse(response);
  }

  public async put<T>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<T>(path, data, config);
    return this.transformResponse(response);
  }

  public async patch<T>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch<T>(path, data, config);
    return this.transformResponse(response);
  }

  public async delete<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<T>(path, config);
    return this.transformResponse(response);
  }

  private transformResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    const responseData = response.data as any;
    
    // Handle the new API format with response_body wrapper
    if (responseData && typeof responseData === 'object' && 'response_body' in responseData) {
      return {
        statusCode: response.status,
        headers: response.headers as Record<string, string>,
        data: responseData.response_body,
        isSuccessful: response.status >= 200 && response.status < 300,
      };
    }
    
    // Handle direct response format (fallback)
    return {
      statusCode: response.status,
      headers: response.headers as Record<string, string>,
      data: responseData,
      isSuccessful: response.status >= 200 && response.status < 300,
    };
  }
}
