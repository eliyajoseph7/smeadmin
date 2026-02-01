// Common types and interfaces used across the application
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  message: string;
  timestamp: string;
  response_code: number;
  response_status: string;
  response_body: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
