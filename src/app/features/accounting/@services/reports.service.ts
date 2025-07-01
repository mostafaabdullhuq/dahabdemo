import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { PaginatedResponse, SearchFilter } from '../../../shared/models/common.models';
import {
  MonthlyReportResponse,
  SalesProfitAnalysusReportResponse,
  SalesReportResponse
} from '../acc-reports/sales/sales-reports.models';
import {
  TotalExpensesReportResponse,
  MonthlyExpensesReportResponse
} from '../acc-reports/expenses/expenses-reports.models';
import {
  StockReportResponse
} from '../acc-reports/stock-details/stock-details-reports.models';


@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private readonly endpoints = {
    salesReport: 'reporting/sales',
    monthlyReport: 'reporting/monthly-sales',
    salesProfitAnalysusReport: "reporting/sales-profit-analysis",
    totalExpenses: "reporting/expenses",
    monthlyExpenses: "reporting/monthly-expenses",
    stockDetails: "reporting/stock",

  }

  constructor(private _http: SingletonService) {
  }

  getSalesReport(filter: SearchFilter = {}) {
    return this._http.get<PaginatedResponse<SalesReportResponse>>(this.endpoints.salesReport, filter);
  }

  getMonthlyReport(filter: SearchFilter = {}) {
    return this._http.get<PaginatedResponse<MonthlyReportResponse>>(this.endpoints.monthlyReport, filter);
  }

  getSalesProfitAnalysisReport(filter: SearchFilter = {}) {
    return this._http.get<PaginatedResponse<SalesProfitAnalysusReportResponse>>(this.endpoints.salesProfitAnalysusReport, filter);
  }

  getTotalExpensesReport(filter: SearchFilter = {}) {
    return this._http.get<PaginatedResponse<TotalExpensesReportResponse>>(this.endpoints.totalExpenses, filter);
  }

  getMonthlyExpensesReport(filter: SearchFilter = {}) {
    return this._http.get<PaginatedResponse<MonthlyExpensesReportResponse>>(this.endpoints.monthlyExpenses, filter);
  }

  getStockReport(filter: SearchFilter = {}) {
    return this._http.get<PaginatedResponse<StockReportResponse>>(this.endpoints.stockDetails, filter);
  }
}
