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
import { BalanceSheetReportResponse } from '../acc-reports/balance-sheets/balance-sheet-reports.models';
import { CashFlowReportResponse } from '../acc-reports/cash-flow/cash-flow-reports.models';
import { ProfitAndLossReportResponse } from '../acc-reports/profit-and-loss/profit-and-loss-reports.models';
import { TrialBalanceReportResponse } from '../acc-reports/trial-balance/trial-balance-reports.models';
import { SuppliersReportResponse } from '../acc-reports/suppliers/suppliers.models';
import { GoldMovementsReportResponse } from '../acc-reports/gold-movements/gold-movements-reports.models';


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
    vatsDataReport: "reporting/vats",
    balanceSheet: "reporting/balance-sheet",
    cashFlow: "reporting/cash-flow",
    profitAndLoss: "reporting/profit-and-loss",
    trialBalance: "reporting/trail-balance",
    suppliers: "reporting/suppliers",
    goldMovements: "reporting/gold-movement",
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

  getSuppliersReport(filter: SearchFilter = {}) {
    return this._http.get<SuppliersReportResponse>(this.endpoints.suppliers, filter);
  }

  getStockAgingReport(filter: SearchFilter = {}) {
    return this._http.get<StockAgingReportResponse>(this.endpoints.stockAging, filter);
  }

  getBalanceSheetReport(filter: SearchFilter = {}) {
    return this._http.get<BalanceSheetReportResponse>(this.endpoints.balanceSheet, filter);
  }

  getCashFlowReport(filter: SearchFilter = {}) {
    return this._http.get<CashFlowReportResponse>(this.endpoints.cashFlow, filter);
  }

  getProfitAndLossReport(filter: SearchFilter = {}) {
    return this._http.get<ProfitAndLossReportResponse>(this.endpoints.profitAndLoss, filter);
  }

  getTrialBalanceReport(filter: SearchFilter = {}) {
    return this._http.get<TrialBalanceReportResponse>(this.endpoints.trialBalance, filter);
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

  getGoldMovementsReport(filter: SearchFilter = {}) {

    // UNCOMMENT if you want to use dummy response

    //     return of(JSON.parse(
    //       `
    //       {
    //   "id": 2,
    //   "name": "DAMAS",
    //   "logo": "https://dahabproject.s3.amazonaws.com/business_logos/PROFILE-2.png",
    //   "date": "2025-07-29",
    //   "report_data": [
    //     {
    //       "ref_no": "POS-20250729-260",
    //       "supplier": "",
    //       "customer": "mark",
    //       "date": "2025-07-29",
    //       "description": "ttb sale",
    //       "type": "TTB",
    //       "gold_wt": 5,
    //       "gold_in": 0,
    //       "gold_out": 4.9995,
    //       "total_balance": -4.9995
    //     },
    //     {
    //       "ref_no": "POS-20250729-261",
    //       "supplier": "",
    //       "customer": "mark",
    //       "date": "2025-07-29",
    //       "description": "ttb sale",
    //       "type": "Scrap-18K",
    //       "gold_wt": 5,
    //       "gold_in": 0,
    //       "gold_out": 3.75,
    //       "total_balance": -3.75
    //     },
    //     {
    //       "ref_no": "POS-20250729-262",
    //       "supplier": "",
    //       "customer": "mark",
    //       "date": "2025-07-29",
    //       "description": "ttb sale",
    //       "type": "Scrap-18K",
    //       "gold_wt": 5,
    //       "gold_in": 0,
    //       "gold_out": 3.75,
    //       "total_balance": -7.5
    //     },
    //     {
    //       "ref_no": "POS-20250729-263",
    //       "supplier": "",
    //       "customer": "mark",
    //       "date": "2025-07-29",
    //       "description": "24 sale",
    //       "type": "24K",
    //       "gold_wt": 5,
    //       "gold_in": 0,
    //       "gold_out": 4.9995,
    //       "total_balance": -4.9995
    //     },
    //     {
    //       "ref_no": "POS-20250729-264",
    //       "supplier": "",
    //       "customer": "mark",
    //       "date": "2025-07-29",
    //       "description": "24 sale",
    //       "type": "24K",
    //       "gold_wt": 5,
    //       "gold_in": 0,
    //       "gold_out": 4.9995,
    //       "total_balance": -9.999
    //     },
    //     {
    //       "ref_no": "POS-20250729-265",
    //       "supplier": "",
    //       "customer": "mark",
    //       "date": "2025-07-29",
    //       "description": "24 sale",
    //       "type": "18K",
    //       "gold_wt": 5,
    //       "gold_in": 0,
    //       "gold_out": 3.75,
    //       "total_balance": -3.75
    //     },
    //     {
    //       "ref_no": "POS-20250729-266",
    //       "supplier": "",
    //       "customer": "mark",
    //       "date": "2025-07-29",
    //       "description": "24 sale",
    //       "type": "18K",
    //       "gold_wt": 5,
    //       "gold_in": 0,
    //       "gold_out": 3.75,
    //       "total_balance": -7.5
    //     },
    //     {
    //       "ref_no": "POS-20250729-267",
    //       "supplier": "",
    //       "customer": "mark",
    //       "date": "2025-07-29",
    //       "description": "18 sale",
    //       "type": "18K",
    //       "gold_wt": 5,
    //       "gold_in": 0,
    //       "gold_out": 3.75,
    //       "total_balance": -11.25
    //     },
    //     {
    //       "ref_no": "POS-20250829-268",
    //       "supplier": "",
    //       "customer": "mark",
    //       "date": "2025-08-29",
    //       "description": "18 sale",
    //       "type": "18K",
    //       "gold_wt": 5,
    //       "gold_in": 0,
    //       "gold_out": 3.75,
    //       "total_balance": -15
    //     }
    //   ],
    //   "summary": {
    //     "total_records": 9,
    //     "total_gold_in": 0,
    //     "total_gold_out": 45,
    //     "final_balance": -45
    //   }
    // }
    //       `
    //     ));

    return this._http.get<GoldMovementsReportResponse>(this.endpoints.goldMovements, filter);
  }
}
