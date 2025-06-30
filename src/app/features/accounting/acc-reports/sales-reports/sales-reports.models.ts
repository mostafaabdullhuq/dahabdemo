export interface SalesReportResponse {
  id: number;
  reference_number: string;
  total_amount: string;
  currency: string;
  customer_name?: string;
  customer_cpr?: string;
  phone?: string;
  created_at: string;
  subtotal: string;
  tax_amount: string;
}

export interface MonthlyReportResponse {
  month: Date;
  total_amount: string;
  quantity: number;
}
