export interface ContactUsSubmission {
  id: string;
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  interest: string;
  message: string;
  createdAt: string;
}

export interface ContactUsPage {
  content: ContactUsSubmission[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
