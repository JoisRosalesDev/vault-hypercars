export interface CookieConsentPreferences {
  essential: true;
  analytics: boolean;
  timestamp: string;
  version: string;
}

export type PrivacyAction = "export" | "delete";

export interface PrivacyRequestPayload {
  email: string;
  action: PrivacyAction;
}

export interface PrivacyExportOrder {
  id: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  items: Array<{
    carName: string;
    brand: string;
    quantity: number;
    priceUSD: number;
  }>;
}

export interface PrivacyExportResponse {
  email: string;
  requestDate: string;
  orders: PrivacyExportOrder[];
  message?: string;
}

export interface PrivacyDeleteResponse {
  success: boolean;
  message: string;
  recordsAffected: number;
}
