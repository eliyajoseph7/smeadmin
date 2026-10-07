import { ApiClient } from '../../../services/network/api-client';
import type { ContactUsPage } from '../types/contact-us';

class ContactUsService {
  private readonly apiClient = ApiClient.getInstance();

  async getSubmissions(page = 0, size = 20): Promise<ContactUsPage> {
    const response = await this.apiClient.get<ContactUsPage>(
      '/admin/website-management/contact-us',
      { params: { page, size } },
    );

    if (!response.isSuccessful || !response.data) {
      throw new Error('Failed to load contact requests');
    }

    return response.data;
  }
}

export const contactUsService = new ContactUsService();
