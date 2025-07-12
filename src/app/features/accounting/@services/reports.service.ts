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
import { Observable, of } from 'rxjs';
import { VatsDataReportResponse, VatsReturnReportResponse, VatsDataReportItem, VatsReturnReportItem } from '../acc-reports/vats/vats-reports.models';


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

  getVatsDataReport(filter: SearchFilter = {}) {
    // Dummy data for VAT Data Report
    const dummyData: VatsDataReportResponse = {
      id: 1,
      name: "DAHAB Jewellery",
      logo: "https://example.com/logo.png",
      currency: "BHD",
      date: new Date().toISOString(),
      vats: {
        count: 5,
        next: null,
        previous: null,
        results: [
          {
            description: "Gold Sales - Invoice #001",
            tax_code: 101,
            tax_name: 15,
            document_date: "2024-01-15",
            document_number: "INV-001",
            voucher_type_name: "Sales Invoice",
            voucher_type_code: "SI",
            account_name: "Sales Revenue",
            tin_number: "123456789",
            tax_amount: 150.000,
            gross_amount: 1000.000
          },
          {
            description: "Silver Purchase - Invoice #002",
            tax_code: 102,
            tax_name: 5,
            document_date: "2024-01-16",
            document_number: "INV-002",
            voucher_type_name: "Purchase Invoice",
            voucher_type_code: "PI",
            account_name: "Cost of Goods Sold",
            tin_number: "987654321",
            tax_amount: 25.000,
            gross_amount: 500.000
          },
          {
            description: "Diamond Sales - Invoice #003",
            tax_code: 103,
            tax_name: 10,
            document_date: "2024-01-17",
            document_number: "INV-003",
            voucher_type_name: "Sales Invoice",
            voucher_type_code: "SI",
            account_name: "Sales Revenue",
            tin_number: "123456789",
            tax_amount: 200.000,
            gross_amount: 2000.000
          },
          {
            description: "Equipment Purchase - Invoice #004",
            tax_code: 104,
            tax_name: 5,
            document_date: "2024-01-18",
            document_number: "INV-004",
            voucher_type_name: "Purchase Invoice",
            voucher_type_code: "PI",
            account_name: "Equipment",
            tin_number: "555666777",
            tax_amount: 50.000,
            gross_amount: 1000.000
          },
          {
            description: "Service Fee - Invoice #005",
            tax_code: 105,
            tax_name: 5,
            document_date: "2024-01-19",
            document_number: "INV-005",
            voucher_type_name: "Sales Invoice",
            voucher_type_code: "SI",
            account_name: "Service Revenue",
            tin_number: "123456789",
            tax_amount: 25.000,
            gross_amount: 500.000
          }
        ]
      }
    };

    return of(dummyData);
  }

  getVatsReturnReport(filter: SearchFilter = {}) {
    // Dummy data for VAT Return Report
    const dummyData: VatsReturnReportResponse = {
      id: 1,
      name: "DAHAB Jewellery",
      logo: "https://example.com/logo.png",
      currency: "BHD",
      date: new Date().toISOString(),
      vats: {
        sales: [
          {
            description: "Gold Sales",
            amount: 5000.000,
            vat_amount: 750.000
          },
          {
            description: "Gold Sales 2",
            amount: 5000.000,
            vat_amount: 750.000
          },
          {
            description: "Silver Sales",
            amount: 3000.000,
            vat_amount: 450.000
          },
          {
            description: "Diamond Sales",
            amount: 8000.000,
            vat_amount: 1200.000
          },
          {
            description: "Service Fees",
            amount: 1000.000,
            vat_amount: 150.000
          }
        ],
        purchase: [
          {
            description: "Gold Purchase",
            amount: 3000.000,
            vat_amount: 450.000
          },
          {
            description: "Silver Purchase",
            amount: 2000.000,
            vat_amount: 300.000
          },
          {
            description: "Equipment Purchase",
            amount: 1500.000,
            vat_amount: 225.000
          },
          {
            description: "Office Supplies",
            amount: 500.000,
            vat_amount: 75.000
          }
        ],
        totals: [
          {
            description: "Total Sales",
            amount: 17000.000,
            vat_amount: 2550.000
          },
          {
            description: "Total Purchase",
            amount: 7000.000,
            vat_amount: 1050.000
          },
          {
            description: "Net VAT Payable",
            amount: 1500.000,
            vat_amount: 1500.000
          }
        ]
      }
    };

    return of(dummyData);
  }
}
