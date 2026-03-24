export type OTPPurpose = 'LOGIN' | 'REGISTRATION';

export interface GenerateOTPRequest {
  phoneNumber: string;
  email: string | null;
  purpose: OTPPurpose;
}

export interface GenerateOTPResponse {
  success: boolean;
  message: string;
  data: {
    phoneNumber: string;
    email: string | null;
    otpCode: string;
    purpose: OTPPurpose;
    expiresAt: string;
    expiryMinutes: number;
    smsSent: boolean;
    emailSent: boolean;
  };
}

export interface OTPError {
  success: false;
  errorCode: string;
  message: string;
}
