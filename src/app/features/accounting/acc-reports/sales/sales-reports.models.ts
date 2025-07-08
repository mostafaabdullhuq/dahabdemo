import { PaginatedResponse } from "../../../pos/interfaces/pos.interfaces";
import { BaseReportResponse } from "../reports.models";

export interface SalesReportResponse extends BaseReportResponse {
  sales: PaginatedResponse<SalesReportItem>
}

export interface SalesReportItem {
  id: number;
  reference_number: string;
  total_amount: string;
  customer_name?: string;
  customer_cpr?: string;
  phone?: string;
  created_at: string;
  subtotal: string;
  tax_amount: string;
}

export interface MonthlySalesReportResponse extends BaseReportResponse {
  sales: PaginatedResponse<MonthlySalesReportItem>;
}

export interface MonthlySalesReportItem {
  month: Date;
  total_amount: string;
  quantity: number;
}

export interface SalesProfitAnalysisReportResponse extends BaseReportResponse {
  sales: PaginatedResponse<SalesProfitAnalysisReportItem>;
}

export interface SalesProfitAnalysisReportItem {
  id: number;
  reference_number: string;
  customer_name: string;
  customer_cpr: string;
  phone: string;
  net_profit: number;
  gold_value: string;
  selling_making_charge: string;
  cost_making_charge: string;
  created_at: string;
}
