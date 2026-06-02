export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';
export type InvoiceTemplate = 'minimal' | 'modern' | 'corporate';
export type DiscountType = 'fixed' | 'percentage';
export type InvoiceStatus = 'draft' | 'sent' | 'paid';
export type ExportFormat = 'pdf' | 'png' | 'jpeg';

export interface InvoiceItem {
  id: string;
  serviceId?: string;
  service: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceDiscount {
  type: DiscountType;
  value: number;
}

export interface ClientInfo {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  countryCode: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: Currency;
  clientId?: string;
  client: ClientInfo;
  items: InvoiceItem[];
  discount?: InvoiceDiscount;
  taxRate: number;
  notes: string;
  paymentInstructions: string;
  terms: string;
  status: InvoiceStatus;
  template: InvoiceTemplate;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedInvoice extends Invoice {
  savedAt: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  countryCode: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  rate: number;
  terms: string;
  createdAt: string;
}

export interface FreelancerProfile {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  logo: string;
  signature: string;
  accentColor: string;
}

export interface AppSettings {
  defaultCurrency: Currency;
  defaultTemplate: InvoiceTemplate;
  defaultTaxRate: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
}

export const DEFAULT_PROFILE: FreelancerProfile = {
  fullName: '',
  businessName: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  bankName: '',
  accountNumber: '',
  accountName: '',
  logo: '',
  signature: '',
  accentColor: '#3b82f6',
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultCurrency: 'NGN',
  defaultTemplate: 'minimal',
  defaultTaxRate: 0,
  invoicePrefix: 'INV',
  nextInvoiceNumber: 1,
};
