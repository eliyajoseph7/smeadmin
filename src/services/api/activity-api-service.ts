import { ApiClient } from '../network/api-client';
import type { 
  ActivityResponse, 
  ActivityQueryParams,
  ActiveUsersPerServiceResponse
} from '../../types/activity';

export class ActivityApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Get recent user activities across all services
   * GET /admin/activities/recent
   */
  async getRecentActivities(params?: ActivityQueryParams): Promise<ActivityResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.startTime) {
      queryParams.append('startTime', params.startTime);
    }
    if (params?.endTime) {
      queryParams.append('endTime', params.endTime);
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `/admin/activities/recent${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.apiClient.get<ActivityResponse>(url);

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch recent activities');
    }

    return response.data;
  }

  /**
   * Get activities for a specific time range (helper method)
   */
  async getActivitiesForTimeRange(
    startTime: Date, 
    endTime: Date, 
    limit: number = 100
  ): Promise<ActivityResponse> {
    return this.getRecentActivities({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      limit
    });
  }

  /**
   * Get activities for today using the dedicated endpoint
   */
  async getTodayActivities(limit: number = 200): Promise<ActivityResponse> {
    const queryParams = new URLSearchParams();
    
    if (limit) {
      queryParams.append('limit', limit.toString());
    }

    const url = `/admin/activities/today${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.apiClient.get<ActivityResponse>(url);

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch today\'s activities');
    }

    return response.data;
  }

  /**
   * Get activities for today using time range (legacy method)
   */
  async getTodayActivitiesLegacy(limit: number = 100): Promise<ActivityResponse> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return this.getActivitiesForTimeRange(startOfDay, endOfDay, limit);
  }

  /**
   * Get activities for the last 24 hours
   */
  async getLast24HoursActivities(limit: number = 100): Promise<ActivityResponse> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return this.getActivitiesForTimeRange(yesterday, now, limit);
  }

  /**
   * Get activities for the last week
   */
  async getLastWeekActivities(limit: number = 100): Promise<ActivityResponse> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return this.getActivitiesForTimeRange(weekAgo, now, limit);
  }

  /**
   * Get activities for a specific store
   */
  async getStoreActivities(
    storeId: string,
    params?: {
      startTime?: string;
      endTime?: string;
      limit?: number;
    }
  ): Promise<ActivityResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.startTime) {
      queryParams.append('startTime', params.startTime);
    }
    if (params?.endTime) {
      queryParams.append('endTime', params.endTime);
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `/admin/activities/store/${storeId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.apiClient.get<ActivityResponse>(url);

    if (!response.isSuccessful || !response.data) {
      throw new Error(`Failed to fetch activities for store ${storeId}`);
    }

    return response.data;
  }

  /**
   * Get store activities for today
   */
  async getStoreActivitiesToday(storeId: string, limit: number = 100): Promise<ActivityResponse> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return this.getStoreActivities(storeId, {
      startTime: startOfDay.toISOString(),
      endTime: endOfDay.toISOString(),
      limit
    });
  }

  /**
   * Get store activities for the last 24 hours
   */
  async getStoreLast24HoursActivities(storeId: string, limit: number = 100): Promise<ActivityResponse> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return this.getStoreActivities(storeId, {
      startTime: yesterday.toISOString(),
      endTime: now.toISOString(),
      limit
    });
  }

  /**
   * Get store activities for the last week
   */
  async getStoreLastWeekActivities(storeId: string, limit: number = 100): Promise<ActivityResponse> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return this.getStoreActivities(storeId, {
      startTime: weekAgo.toISOString(),
      endTime: now.toISOString(),
      limit
    });
  }

  /**
   * Get active users count per service
   */
  async getActiveUsersPerService(since?: string): Promise<ActiveUsersPerServiceResponse> {
    const queryParams = new URLSearchParams();
    
    if (since) {
      queryParams.append('since', since);
    }

    const url = `/admin/activities/active-users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.apiClient.get<ActiveUsersPerServiceResponse>(url);

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch active users per service');
    }

    return response.data;
  }

  /**
   * Get active users per service for the last hour
   */
  async getActiveUsersLastHour(): Promise<ActiveUsersPerServiceResponse> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.getActiveUsersPerService(oneHourAgo.toISOString());
  }

  /**
   * Get active users per service for the last 24 hours
   */
  async getActiveUsersLast24Hours(): Promise<ActiveUsersPerServiceResponse> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.getActiveUsersPerService(twentyFourHoursAgo.toISOString());
  }

  /**
   * Get active users per service since today
   */
  async getActiveUsersToday(): Promise<ActiveUsersPerServiceResponse> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return this.getActiveUsersPerService(startOfDay.toISOString());
  }

  /**
   * Get today's activities using the dedicated endpoint
   */
  async getTodayActivitiesEndpoint(limit: number = 200): Promise<ActivityResponse> {
    const queryParams = new URLSearchParams();
    
    if (limit) {
      queryParams.append('limit', limit.toString());
    }

    const url = `/admin/activities/today${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.apiClient.get<ActivityResponse>(url);

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch today\'s activities');
    }

    return response.data;
  }
}

export const activityApiService = new ActivityApiService();
