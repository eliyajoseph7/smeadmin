// App Version API Models based on the correct API endpoints

// Download URLs for different platforms
export interface DownloadUrls {
  android: string;
  ios: string;
}

// Update Priority Types (matching API response format)
export type UpdatePriority = 'optional' | 'recommended' | 'critical';

// Platform Types
export type PlatformType = 'ios' | 'android';

// App Version from API response
export interface AppVersion {
  id: string;
  latest_version: string;
  minimum_required_version: string;
  update_priority: UpdatePriority;
  platform_type: PlatformType;
  release_notes: string;
  release_date: string;
  download_url: DownloadUrls;
  new_features: string[];
  bug_fixes: string[];
}

// App Version Check Response (for checking updates)
export interface AppVersionCheckResponse extends AppVersion {
  // Same structure as AppVersion for now
}

// Create App Version Request
export interface CreateAppVersionRequest {
  latest_version: string;
  minimum_required_version: string;
  update_priority: UpdatePriority;
  platform_type: PlatformType;
  release_notes: string;
  release_date: string;
  download_url: DownloadUrls;
  new_features: string[];
  bug_fixes: string[];
}

// Update App Version Request (partial update)
export interface UpdateAppVersionRequest {
  minimum_required_version?: string;
  update_priority?: UpdatePriority;
  platform_type?: PlatformType;
  release_notes?: string;
  download_url?: DownloadUrls;
  new_features?: string[];
  bug_fixes?: string[];
}

// Version History Response with pagination
export interface VersionHistoryResponse {
  pagination: {
    totalPages: number;
    page: number;
    total: number;
    limit: number;
  };
  response_body: AppVersion[];
  status: string;
}

// Delete Version Response
export interface DeleteVersionResponse {
  status: string;
  message: string;
}
