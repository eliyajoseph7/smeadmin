import { ApiClient } from '../network/api-client';

export interface BroadcastSmsRequest {
  message: string;
}

export interface BroadcastSmsSelectedUsersRequest extends BroadcastSmsRequest {
  phoneNumbers: string[];
}

export interface BroadcastSmsResponse {
  message: string;
  responseBody?: unknown;
}

class BroadcastSmsApiService {
  private apiClient: ApiClient;
  private static readonly ENDPOINT = '/auth/internal/broadcast-sms';

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  async broadcastToAllUsers(payload: BroadcastSmsRequest): Promise<BroadcastSmsResponse> {
    const response = await this.apiClient.post<any>(
      `${BroadcastSmsApiService.ENDPOINT}?target=ALL_USERS`,
      {
        message: payload.message.trim(),
      }
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to send broadcast SMS');
    }

    return {
      message: response.data.message || 'Broadcast SMS sent successfully',
      responseBody: response.data.response_body,
    };
  }

  async broadcastToSelectedUsers(payload: BroadcastSmsSelectedUsersRequest): Promise<BroadcastSmsResponse> {
    const phoneNumbers = [...new Set(payload.phoneNumbers.map((phoneNumber) => phoneNumber.trim()).filter(Boolean))];

    const response = await this.apiClient.post<any>(
      BroadcastSmsApiService.ENDPOINT,
      {
        message: payload.message.trim(),
        phoneNumbers,
      }
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to send broadcast SMS');
    }

    return {
      message: response.data.message || 'Broadcast SMS sent successfully',
      responseBody: response.data.response_body,
    };
  }
}

export const broadcastSmsApiService = new BroadcastSmsApiService();
