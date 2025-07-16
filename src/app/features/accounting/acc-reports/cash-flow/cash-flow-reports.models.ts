import { BaseReportResponse } from "../reports.models";

export interface CashFlowReportResponse extends BaseReportResponse {
    report_type: string;
    cash_flow: CashFlowData;
}

export interface CashFlowData {
    opening_balance: number;
    cash_inflow: CashFlowItem[];
    cash_outflow: CashFlowItem[];
    net_cash_flow: number;
    ending_cash_balance: number;
}

export interface CashFlowItem {
    account_name: string;
    account_code: string;
    debit_amount?: number;
    credit_amount?: number;
}

export interface CashFlowTableItem {
    description: string;
    amount: number | null;
    isCategory: boolean;
    isTotal: boolean;
    account_code?: string;
}
