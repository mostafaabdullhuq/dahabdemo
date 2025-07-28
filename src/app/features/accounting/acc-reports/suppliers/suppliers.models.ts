import { PaginatedResponse } from "../../../../shared/models/common.models"
import { BaseReportResponse } from "../reports.models"


export interface SuppliersReportResponse extends BaseReportResponse {
  suppliers: PaginatedResponse<SuppliersReportItem>
}

export interface SuppliersReportItem {
  id: number;
  name: string;
  total_due_weight: string;
  total_due_amount: string;
  advance_amount_balance: string;
  advance_weight_balance: string;
}
