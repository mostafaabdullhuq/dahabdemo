import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { PaginatedResponse, SearchFilter } from '../../../shared/models/common.models';
import {
  MonthlySalesReportResponse,
  SalesProfitAnalysisReportResponse,
  SalesReportResponse
} from '../acc-reports/sales/sales-reports.models';
import {
  TotalExpensesReportResponse,
  MonthlyExpensesReportResponse
} from '../acc-reports/expenses/expenses-reports.models';
import {
  StockAgingReportResponse,
  StockDetailsReportResponse
} from '../acc-reports/stocks/stock-reports.models';
import {
  LiabilitiesReportResponse
} from '../acc-reports/liabilities/liabilities.models';
import {
  AssetsReportResponse
} from '../acc-reports/assets/assets.models';


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
    stockAging: "reporting/stock-aging",
    liabilities: "reporting/liabilities",
    assets: "reporting/assets",

  }

  constructor(private _http: SingletonService) {
  }

  getSalesReport(filter: SearchFilter = {}) {
    return this._http.get<SalesReportResponse>(this.endpoints.salesReport, filter);
  }

  getMonthlyReport(filter: SearchFilter = {}) {
    return this._http.get<MonthlySalesReportResponse>(this.endpoints.monthlyReport, filter);
  }

  getSalesProfitAnalysisReport(filter: SearchFilter = {}) {
    return this._http.get<SalesProfitAnalysisReportResponse>(this.endpoints.salesProfitAnalysusReport, filter);
  }

  getTotalExpensesReport(filter: SearchFilter = {}) {
    return this._http.get<TotalExpensesReportResponse>(this.endpoints.totalExpenses, filter);
  }

  getMonthlyExpensesReport(filter: SearchFilter = {}) {
    return this._http.get<MonthlyExpensesReportResponse>(this.endpoints.monthlyExpenses, filter);
  }

  getStockReport(filter: SearchFilter = {}) {
    return this._http.get<StockDetailsReportResponse>(this.endpoints.stockDetails, filter);
  }

  getLiabilitiesReport(filter: SearchFilter = {}) {
    return this._http.get<LiabilitiesReportResponse>(this.endpoints.liabilities, filter);
  }

  getAssetsReport(filter: SearchFilter = {}) {
    return this._http.get<AssetsReportResponse>(this.endpoints.assets, filter);
  }

  getStockAgingReport(filter: SearchFilter = {}) {
    return this._http.get<StockAgingReportResponse>(this.endpoints.stockAging, filter);
  }
}
