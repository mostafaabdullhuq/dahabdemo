
import { BaseReportResponse } from "../reports.models";

export interface BalanceSheetReportResponse extends BaseReportResponse {
  balances: Balances;
}

type Balances = { [key: string]: number | Balances }

export interface BalanceSheetReport {
  sales: VatsReturnReportItem[];
  purchase: VatsReturnReportItem[];
  totals: VatsReturnReportItem[];
}

export interface VatsReturnReportItem {
  description: string;
  amount: number;
  vat_amount: number;
}
