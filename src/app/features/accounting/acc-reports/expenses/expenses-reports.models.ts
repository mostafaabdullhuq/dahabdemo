export interface TotalExpensesReportResponse {
  id: number;
  name: string;
  amount: number;
}

interface ExpenseItem {
  month: string; // iso date not month (i.e: 2025-06-01T00:00:00Z)
  amount: number;
}

export interface MonthlyExpensesReportResponse {
  id: number;
  name: string;
  values: ExpenseItem[]
}
