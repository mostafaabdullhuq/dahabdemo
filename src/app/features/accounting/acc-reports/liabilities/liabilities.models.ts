import { PaginatedResponse } from "../../../../shared/models/common.models"
import { BaseReportResponse } from "../reports.models"


export interface LiabilitiesReportResponse extends BaseReportResponse {
  liabilities: PaginatedResponse<LiabilitiesReportItem>
}

export interface LiabilitiesReportItem {
  id: number;
  name: string;
  amount: number;
}
