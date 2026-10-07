import { ApiClient } from '../network/api-client';

export interface BroadcastSmsRequest {
  campaignName?: string;
  message: string;
  deliveryChannel?: CampaignDeliveryChannel;
}

export interface BroadcastSmsSelectedUsersRequest extends BroadcastSmsRequest {
  phoneNumbers: string[];
}

export interface BroadcastSmsResponse {
  message: string;
  responseBody?: unknown;
}

export interface WhatsAppTemplateParameter {
  type: string;
  parameter_name?: string;
  parameterName?: string;
  text: string;
}

export interface FilteredBroadcastSmsRequest {
  campaignName?: string;
  message?: string;
  messageTemplateId?: string;
  targetMode?: CampaignTargetMode;
  deliveryChannel?: CampaignDeliveryChannel;
  templateName?: string;
  languageCode?: string;
  bodyParameters?: WhatsAppTemplateParameter[];
  phoneNumbers?: string[];
  sources?: string[];
  registeredFromDate?: string;
  registeredToDate?: string;
  minProductCount?: number;
  maxProductCount?: number;
  minSaleCount?: number;
  maxSaleCount?: number;
  minPurchaseCount?: number;
  maxPurchaseCount?: number;
  minStoreCount?: number;
  maxStoreCount?: number;
  minStaffCount?: number;
  maxStaffCount?: number;
  expiredPlanOnly?: boolean;
  activePlanOnly?: boolean;
}

export type CampaignTargetMode = 'ALL_USERS' | 'SELECTED_USERS' | 'FILTERED_USERS';
export type CampaignDeliveryChannel = 'SMS' | 'WHATSAPP' | 'BOTH';

export interface SmsCampaign {
  id: string;
  target: string;
  campaignName?: string;
  messageContent: string;
  filtersJson?: string;
  deliveryChannel?: CampaignDeliveryChannel;
  parentCampaignId?: string;
  messageTemplateId?: string;
  recipientCount?: number;
  messageLength?: number;
  isDemo?: boolean;
  status?: string;
  createdAt?: string;
}

export interface MessageTemplateParameter extends WhatsAppTemplateParameter {}

export interface MessageTemplate {
  id: string;
  metaTemplateId?: string;
  templateName: string;
  languageCode: string;
  category: string;
  bodyText: string;
  componentsJson?: string;
  defaultBodyParametersJson?: string;
  status?: string;
  rejectedReason?: string;
  qualityScore?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  lastSyncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageTemplateRequest {
  templateName: string;
  languageCode: string;
  category: string;
  bodyText: string;
  headerText?: string;
  footerText?: string;
  defaultBodyParameters?: MessageTemplateParameter[];
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
        campaignName: payload.campaignName?.trim() || undefined,
        message: payload.message.trim(),
        deliveryChannel: payload.deliveryChannel || 'SMS',
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
        campaignName: payload.campaignName?.trim() || undefined,
        message: payload.message.trim(),
        deliveryChannel: payload.deliveryChannel || 'SMS',
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

  async broadcastToFilteredUsers(payload: FilteredBroadcastSmsRequest): Promise<BroadcastSmsResponse> {
    const response = await this.apiClient.post<any>(
      `${BroadcastSmsApiService.ENDPOINT}/filtered`,
      {
        ...payload,
        message: payload.message?.trim(),
      }
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to send filtered SMS campaign');
    }

    return {
      message: response.data.message || 'SMS campaign queued successfully',
      responseBody: response.data.response_body,
    };
  }

  async getCampaigns(): Promise<SmsCampaign[]> {
    const response = await this.apiClient.get<any>('/auth/internal/sms-campaigns');

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch SMS campaigns');
    }

    return Array.isArray(response.data) ? response.data : response.data.response_body || [];
  }

  async rerunCampaign(campaignId: string): Promise<BroadcastSmsResponse> {
    const response = await this.apiClient.post<any>(`/auth/internal/sms-campaigns/${campaignId}/rerun`, {});

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to rerun campaign');
    }

    return {
      message: response.data.message || 'Campaign rerun queued successfully',
      responseBody: response.data.response_body,
    };
  }

  async rerunCampaignWithOptions(
    campaignId: string,
    payload: Pick<FilteredBroadcastSmsRequest, 'campaignName' | 'message' | 'messageTemplateId' | 'deliveryChannel' | 'templateName' | 'languageCode' | 'bodyParameters'>
  ): Promise<BroadcastSmsResponse> {
    const response = await this.apiClient.post<any>(`/auth/internal/sms-campaigns/${campaignId}/rerun`, payload);

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to rerun campaign');
    }

    return {
      message: response.data.message || 'Campaign rerun queued successfully',
      responseBody: response.data.response_body,
    };
  }

  async getMessageTemplates(): Promise<MessageTemplate[]> {
    const response = await this.apiClient.get<any>('/auth/internal/whatsapp/message-templates');

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to fetch message templates');
    }

    return Array.isArray(response.data) ? response.data : response.data.response_body || [];
  }

  async createMessageTemplate(payload: MessageTemplateRequest): Promise<MessageTemplate> {
    const response = await this.apiClient.post<any>('/auth/internal/whatsapp/message-templates', payload);

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to create message template');
    }

    return response.data.response_body || response.data;
  }

  async updateMessageTemplate(templateId: string, payload: MessageTemplateRequest): Promise<MessageTemplate> {
    const response = await this.apiClient.put<any>(`/auth/internal/whatsapp/message-templates/${templateId}`, payload);

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to update message template');
    }

    return response.data.response_body || response.data;
  }

  async syncMessageTemplates(): Promise<BroadcastSmsResponse> {
    const response = await this.apiClient.post<any>('/auth/internal/whatsapp/message-templates/sync', {});

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to sync message templates');
    }

    return {
      message: response.data.message || 'Message templates synced successfully',
      responseBody: response.data.response_body,
    };
  }
}

export const broadcastSmsApiService = new BroadcastSmsApiService();
