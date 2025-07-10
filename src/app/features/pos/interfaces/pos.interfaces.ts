export interface Customer {
  id: number;
  created_by_name: string;
  business: string;
  created_by: string;
  created_at: string; // Could be Date, but API returns string
  cpr_attachment: string | null;
  group_name: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cpr: string;
  contact_id: string;
  opening_balance: string; // API returns as string with decimals
  custom_fields: CustomField[];
  display_value?: string;
}

export interface CustomField {
  id?: number;
  name: string;
  value: any;
  type?: 'text' | 'number' | 'date' | 'boolean';
}

// For backward compatibility if needed
export interface CustomerDropdown {
  id: number;
  pk: number; // Sometimes APIs use pk instead of id
  name: string;
  email: string;
  phone: string;
  contact_id: string;
}

// Updated Currency interface to match actual API response
export interface Currency {
  pk: number;
  currency: number; // Reference to currency ID
  exchange_rate: string;
  currency_name: string;
  currency_symbol: string;
  currency_code: string;
  currency_decimal_point: number;
  default: boolean;
}

// Updated Payment Method interface to match actual API response
export interface PaymentMethod {
  id: number;
  name: string;
}

// Tax interface - matches actual API response
export interface Tax {
  id: number;
  country: string;
  country_tax_rate: string;
  name: string;
  rate: string; // API returns as string, needs conversion to number
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export type CustomerResponse = PaginatedResponse<Customer>;

export type CurrencyResponse = PaginatedResponse<Currency>;

// Payment method API returns simple array, not paginated response
export type PaymentMethodResponse = PaymentMethod[];

export type TaxRatesResponse = PaginatedResponse<Tax>;

export interface ShiftData {
  shift_id: number | null;
  branch: number | null;
  is_active: boolean | null;
}

export interface BranchTax {
  tax_rate: string;
  country: string;
}
