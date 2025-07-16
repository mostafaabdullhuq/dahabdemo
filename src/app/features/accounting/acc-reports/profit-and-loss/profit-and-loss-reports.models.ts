import { BaseReportResponse } from "../reports.models";

export interface ProfitAndLossReportResponse extends BaseReportResponse {
    report_type: string;
    profit_and_loss: ProfitAndLossNodeMap;
    totals: ProfitAndLossTotals;
}

export interface ProfitAndLossNodeMap {
    [key: string]: ProfitAndLossNode;
}

export interface ProfitAndLossNode {
    name: string;
    code: string;
    total_amount: number;
    id: number;
    balance: number;
    quantity: number;
    subaccounts?: ProfitAndLossNodeMap;
}

export interface ProfitAndLossTotals {
    total_revenue: number;
    total_cogs: number;
    total_other_income: number;
    total_expenses: number;
    gross_profit: number;
    operating_income: number;
    net_income: number;
}

export interface ProfitAndLossTableItem {
    description: string;
    amount: number | null;
    level: number;
    isParent: boolean;
    code: string;
    id: number;
}
