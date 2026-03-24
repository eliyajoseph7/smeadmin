import { ApiClient } from '../network/api-client';
import type { GenerateOTPRequest, GenerateOTPResponse } from '../../types/otp';

class OTPApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Admin endpoint to generate OTP for a user
   * POST /auth/admin/generate-otp
   */
  async generateOTP(request: GenerateOTPRequest): Promise<GenerateOTPResponse> {
    const response = await this.apiClient.post<any>(
      '/auth/admin/generate-otp',
      request
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to generate OTP');
    }

    // Handle both wrapped and unwrapped responses
    const apiData = response.data.response_body || response.data;
    
    if (!apiData) {
      throw new Error('Invalid API response structure');
    }

    // Return the mapped response
    return {
      success: true,
      message: response.data.message || 'OTP generated successfully',
      data: apiData
    };
  }
}

export const otpApiService = new OTPApiService();
