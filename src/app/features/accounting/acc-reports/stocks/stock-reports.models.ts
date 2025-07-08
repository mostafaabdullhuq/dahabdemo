import { PaginatedResponse } from "../../../../shared/models/common.models";
import { BaseReportResponse } from "../reports.models";

export interface StockDetailsReportResponse extends BaseReportResponse {
  products: PaginatedResponse<StockDetailsReportItem>
}

export interface StockDetailsReportItem {
  id: number;
  description: string;
  category: string;
  tag_number: string;
  stone_weight: number;
  gross_weight: number;
  pure_weight: string;
  price: string;
}


export interface StockAgingReportResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StockAgingReportResults;
}

export interface StockAgingReportResults {
  branch: string | null;
  period: number;
  max_period: number;
  buckets: StockAgingReportBucket[];
  logo: string;
}

export interface StockAgingReportBucket {
  range: string; // e.g., "1-30", "31-60"
  products: StockAgingReportProduct[];
}

export interface StockAgingReportProduct {
  id: number;
  description: string;
  category_id: number;
  tag_number: string;
  price: number;
  stock_quantity: number;
  branchproduct_created_at: string;
  branch_id: number
}
