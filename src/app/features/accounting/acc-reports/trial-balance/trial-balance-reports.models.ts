import { BaseReportResponse } from "../reports.models";

export interface TrialBalanceReportResponse extends BaseReportResponse {
  report_type: string;
  trial_balance: TrialBalanceNodeMap;
}

export interface TrialBalanceNodeMap {
  [key: string]: TrialBalanceNode;
}

export interface TrialBalanceNode {
  name: string;
  code: string;
  total_amount: number;
  id: number;
  balance: TrialBalanceReportBalances;
  quantity: TrialBalanceReportBalances;
  subaccounts?: TrialBalanceNodeMap;
}

export interface TrialBalanceReportBalances {
  debit: number;
  credit: number;
  total: number;
}

export interface TrialBalanceTableItem {
  code: string;
  description: string;
  fcCurrency?: string;
  fcAmount?: number | null;
  debitAmount: number | null;
  creditAmount: number | null;
  quantityDebit: number | null;
  quantityCredit: number | null;
  quantityTotal: number | null;
  level: number;
  isParent: boolean;
  id: number;
}
