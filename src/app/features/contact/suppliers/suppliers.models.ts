

export interface SupplierSummaryRes {
  id: number;
  total_due_amount: number;
  total_due_weight: number;
  total_purchase_amount: string;
  total_purchase_weight: string;
  total_paid_amount: string;
  total_paid_weight: string;
  advance_amount_balance: string;
  advance_weight_balance: string;
  opening_balance_amount: string;
  opening_balance_weight: string;
}
