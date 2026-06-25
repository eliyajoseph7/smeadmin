import { ApiClient } from '../network/api-client';

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoLink: string;
  thumbnail?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VideoPayload {
  title: string;
  description: string;
  videoLink: string;
  thumbnail?: string;
}

export interface VideoListParams {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
}

type VideoEnvelope<T> = {
  status?: string;
  message?: string;
  response_body?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  deleted_id?: string;
};

export class VideoApiService {
  private static apiClient = ApiClient.getInstance();
  private static readonly BASE_PATH = '/auth/videos';

  static async getVideos(params: VideoListParams = {}): Promise<VideoItem[]> {
    const page = params.page ?? 0;
    const limit = params.limit ?? 20;
    const activeOnly = params.activeOnly ?? true;

    const response = await this.apiClient.get<VideoItem[] | VideoEnvelope<VideoItem[]>>(
      this.BASE_PATH,
      { params: { page, limit, activeOnly } }
    );

    const payload = this.extractPayload<unknown[]>(response.data);
    return Array.isArray(payload) ? payload.map((item) => this.mapVideo(item)) : [];
  }

  static async getVideoById(id: string): Promise<VideoItem> {
    const response = await this.apiClient.get<VideoItem | VideoEnvelope<VideoItem>>(
      `${this.BASE_PATH}/${id}`
    );

    return this.mapVideo(this.extractPayload(response.data));
  }

  static async createVideo(payload: VideoPayload): Promise<VideoItem> {
    const response = await this.apiClient.post<VideoItem | VideoEnvelope<VideoItem>>(
      this.BASE_PATH,
      this.buildPayload(payload)
    );

    return this.mapVideo(this.extractPayload(response.data));
  }

  static async updateVideo(id: string, payload: VideoPayload): Promise<VideoItem> {
    const response = await this.apiClient.put<VideoItem | VideoEnvelope<VideoItem>>(
      `${this.BASE_PATH}/${id}`,
      this.buildPayload(payload)
    );

    return this.mapVideo(this.extractPayload(response.data));
  }

  static async deleteVideo(id: string): Promise<{ deletedId: string; message: string }> {
    const response = await this.apiClient.delete<VideoEnvelope<never>>(`${this.BASE_PATH}/${id}`);
    const data = response.data || {};

    return {
      deletedId: data.deleted_id || id,
      message: data.message || 'Video deleted successfully',
    };
  }

  private static buildPayload(payload: VideoPayload) {
    return {
      title: payload.title.trim(),
      description: payload.description.trim(),
      videoLink: payload.videoLink.trim(),
      ...(payload.thumbnail?.trim() ? { thumbnail: payload.thumbnail.trim() } : {}),
    };
  }

  private static extractPayload<T>(data: T | VideoEnvelope<T>): T {
    if (data && typeof data === 'object' && 'response_body' in (data as VideoEnvelope<T>)) {
      return ((data as VideoEnvelope<T>).response_body ?? []) as T;
    }

    return data as T;
  }

  private static mapVideo(item: any): VideoItem {
    return {
      id: String(item?.id || ''),
      title: String(item?.title || ''),
      description: String(item?.description || ''),
      videoLink: String(item?.videoLink || ''),
      thumbnail: item?.thumbnail ? String(item.thumbnail) : undefined,
      isActive: Boolean(item?.isActive),
      createdAt: String(item?.createdAt || ''),
      updatedAt: String(item?.updatedAt || ''),
    };
  }
}
