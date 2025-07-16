
import { BaseReportResponse } from "../reports.models";

export interface BalanceSheetReportResponse extends BaseReportResponse {
  report_type: string;
  balance_sheet: BalanceSheetNodeMap;
  totals: BalanceSheetTotals;
}

export interface BalanceSheetNodeMap {
  [key: string]: BalanceSheetNode;
}

export interface BalanceSheetNode {
  name: string;
  code: string;
  total_amount: number;
  id: number;
  balance: number;
  quantity: number;
  subaccounts?: BalanceSheetNodeMap;
}

export interface BalanceSheetTotals {
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  net_income: number;
}
