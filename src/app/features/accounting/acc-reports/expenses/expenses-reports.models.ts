import { PaginatedResponse } from "../../../../shared/models/common.models";
import { BaseReportResponse } from "../reports.models";

export interface TotalExpensesReportResponse extends BaseReportResponse {
  expenses: PaginatedResponse<TotalExpensesReportItem>
}

export interface TotalExpensesReportItem {
  id: number;
  name: string;
  amount: number;
}

export interface MonthlyExpensesReportResponse extends BaseReportResponse {
  expenses: PaginatedResponse<MonthlyExpensesReportItem>
}

export interface MonthlyExpensesReportItem {
  id: number;
  name: string;
  values: ExpenseItem[]
}

interface ExpenseItem {
  month: string; // iso date not month (i.e: 2025-06-01T00:00:00Z)
  amount: number;
}
