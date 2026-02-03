export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
  isActive: boolean;
}

export interface RoleInfo {
  id: string;
  name: string;
  displayName: string;
}

export interface Admin {
  id: string;
  email: string;
  fullName: string;
  role: string;
  roleInfo: RoleInfo;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  phoneNumber?: string;
  lastLoginAt?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
  permissionCount: number;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    admin: Admin;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  };
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  fullName: string;
  role: string;
  phoneNumber?: string;
}

export interface UpdateAdminRequest {
  fullName?: string;
  phoneNumber?: string;
  role?: string;
}

export interface UpdateAdminStatusRequest {
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  response_code: number;
  response_status: string;
  response_body: T;
  timestamp: string;
  message?: string;
}

export interface SimpleResponse {
  success: boolean;
  message: string;
}

export type AdminRole = 'SUPER_ADMIN' | 'SUPPORT_ADMIN' | 'FINANCE_ADMIN';
export type AdminStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
