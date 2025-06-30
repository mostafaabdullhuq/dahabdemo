import {Injectable} from '@angular/core';
import {SingletonService} from '../../../core/services/singleton.service';
import {PaginatedResponse, SearchFilter} from '../../../shared/models/common.models';
import {MonthlyReportResponse, SalesReportResponse} from '../acc-reports/sales-reports/sales-reports.models';


@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private readonly endpoints = {
    salesReport: 'reporting/sales/',
    monthlyReport: 'reporting/monthly-sales/'
  }

  constructor(private _http: SingletonService) {
  }

  getSalesReport(filter: SearchFilter = {}) {
    return this._http.get<PaginatedResponse<SalesReportResponse>>(this.endpoints.salesReport, filter);
  }

  getMonthlyReport(filter: SearchFilter = {}) {
    return this._http.get<PaginatedResponse<MonthlyReportResponse>>(this.endpoints.monthlyReport, filter);
  }
}
