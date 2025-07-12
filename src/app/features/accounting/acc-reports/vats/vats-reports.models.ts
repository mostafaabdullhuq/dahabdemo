import { PaginatedResponse } from "../../../pos/interfaces/pos.interfaces";
import { BaseReportResponse } from "../reports.models";

export interface VatsReturnReportResponse extends BaseReportResponse {
  vats: VatsReturnReportCategories;
}

export interface VatsReturnReportCategories {
  sales: VatsReturnReportItem[];
  purchase: VatsReturnReportItem[];
  totals: VatsReturnReportItem[];
}

export interface VatsReturnReportItem {
  description: string;
  amount: number;
  vat_amount: number;
}

export interface VatsDataReportResponse extends BaseReportResponse {
  vats: PaginatedResponse<VatsDataReportItem>;
}

export interface VatsDataReportItem {
  description: string;
  tax_code: number;
  tax_name: number;
  document_date: string;
  document_number: string;
  voucher_type_name: string;
  voucher_type_code: string;
  account_name: string;
  tin_number: string;
  tax_amount: number;
  gross_amount: number;
}
