import { PaginatedResponse } from "../../../../shared/models/common.models"
import { BaseReportResponse } from "../reports.models"


export interface SuppliersReportResponse extends BaseReportResponse {
  suppliers: PaginatedResponse<SuppliersReportItem>
}

export interface SuppliersReportItem {
  name: string;
  referene_number: string;
  total_due_weight: string;
  total_due_amount: string;
  amount_advance_balance: string;
  weight_advance_balance: string;
}
