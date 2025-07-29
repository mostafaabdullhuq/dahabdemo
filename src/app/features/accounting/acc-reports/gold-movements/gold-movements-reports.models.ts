
export interface GoldMovementsReportResponse {
  id: number;
  name: string;
  logo: string;
  date: string;
  report_data: GoldMovementsTableItem[];
  summary: GoldMovementsTotals;
}

export interface GoldMovementsTotals {
  total_records: number;
  total_gold_in: number;
  total_gold_out: number;
  final_balance: number;
}

export interface GoldMovementsTableItem {
  ref_no: string;
  supplier: string;
  customer: string;
  date: string;
  description: string;
  type: string;
  gold_wt: number;
  gold_in: number;
  gold_out: number;
  total_balance: number;
}
