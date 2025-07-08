import { PaginatedResponse } from "../../../../shared/models/common.models";
import { BaseReportResponse } from "../reports.models";

export interface StockReportResponse extends BaseReportResponse {
  products: PaginatedResponse<StockReportItem>
}

export interface StockReportItem {
  id: number;
  description: string;
  category: string;
  tag_number: string;
  stone_weight: number;
  gross_weight: number;
  pure_weight: string;
  price: string;
}
