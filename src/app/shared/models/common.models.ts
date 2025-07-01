import {SalesReportResponse} from '../../features/accounting/acc-reports/sales/sales-reports.models';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SearchFilter {
  page?: number;
  page_size?: number;
  search?: string;

  [key: string]: any;
}

export class DataTableOptions {
  firstIndex: number = 0;
  currentPage: number = 1;
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50];
  pageSize: number = this.rowsPerPageOptions ? this.rowsPerPageOptions[0] : 10;
}

export type DataTableColumn = {
  field: string;
  header: string;
  body?: (row: SalesReportResponse) => string | number;
}
