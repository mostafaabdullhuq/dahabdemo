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
    balance: number;
    quantity: number;
    subaccounts?: TrialBalanceNodeMap;
}

export interface TrialBalanceTableItem {
    description: string;
    amount: number | null;
    balance: number | null;
    level: number;
    isParent: boolean;
    code: string;
    id: number;
}
