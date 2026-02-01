import type { BaseEntity } from './common.model';

// Version Check Response from API
export interface VersionCheckResponse {
  latest_version: string;
  minimum_required_version: string;
  update_priority: UpdatePriority;
  release_notes: string;
  release_date: string;
  download_url: DownloadUrls;
  new_features: string[];
  bug_fixes: string[];
}

// Download URLs for different platforms
export interface DownloadUrls {
  android: string;
  ios: string;
}

// Update Priority Types
export type UpdatePriority = 'optional' | 'recommended' | 'critical' | 'forced';

// Version Check Entity (for CRUD operations)
export interface VersionCheck extends BaseEntity {
  latestVersion: string;
  minimumRequiredVersion: string;
  updatePriority: UpdatePriority;
  releaseNotes: string;
  releaseDate: string;
  androidDownloadUrl: string;
  iosDownloadUrl: string;
  newFeatures: string[];
  bugFixes: string[];
  isActive: boolean;
  displayOrder: number;
}

// Create Version Check Request
export interface CreateVersionCheckRequest {
  latestVersion: string;
  minimumRequiredVersion: string;
  updatePriority: UpdatePriority;
  releaseNotes: string;
  releaseDate: string;
  androidDownloadUrl: string;
  iosDownloadUrl: string;
  newFeatures: string[];
  bugFixes: string[];
  isActive?: boolean;
  displayOrder?: number;
}

// Update Version Check Request
export interface UpdateVersionCheckRequest extends Partial<CreateVersionCheckRequest> {
  id: string;
}

// Version Check List Response
export interface VersionCheckListResponse {
  versions: VersionCheck[];
  total: number;
  page: number;
  limit: number;
}
