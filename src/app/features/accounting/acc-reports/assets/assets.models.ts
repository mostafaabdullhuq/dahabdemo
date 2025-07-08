import { PaginatedResponse } from "../../../../shared/models/common.models"
import { BaseReportResponse } from "../reports.models"


export interface AssetsReportResponse extends BaseReportResponse {
  assets: PaginatedResponse<AssetsReportItem>
}

export interface AssetsReportItem {
  id: number;
  name: string;
  amount: number;
}
