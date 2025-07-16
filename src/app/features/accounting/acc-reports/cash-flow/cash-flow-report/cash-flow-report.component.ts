import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReportsService } from '../../../@services/reports.service';
import { CashFlowReportResponse, CashFlowData, CashFlowTableItem } from '../cash-flow-reports.models';
import { ToasterMsgService } from '../../../../../core/services/toaster-msg.service';
import { ReportExportService, ReportConfig, ReportColumn } from '../../../@services/report-export.service';
import { DropdownsService } from '../../../../../core/services/dropdowns.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { DataTableColumn } from '../../../../../shared/models/common.models';

@Component({
  selector: 'app-cash-flow-report',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './cash-flow-report.component.html',
  styleUrl: './cash-flow-report.component.scss'
})
export class CashFlowReportComponent implements OnInit {
  filterForm!: FormGroup;
  branches: any[] = [];
  cashFlowData: CashFlowData | null = null;
  cashFlowTableData: CashFlowTableItem[] = [];
  currency: string = '';

  columns: DataTableColumn<CashFlowTableItem>[] = [
    {
      field: "description",
      header: "Description",
      body: (row: CashFlowTableItem) => this.getDescriptionDisplay(row)
    },
    {
      field: "amount",
      header: "Amount",
      body: (row: CashFlowTableItem) => this.getFormattedAmount(row)
    }
  ];

  exportItems = [
    {
      label: 'Export to PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.exportToPDF()
    },
    {
      label: 'Export to Excel',
      icon: 'pi pi-file-excel',
      command: () => this.exportToExcel()
    },
    {
      label: 'Export to CSV',
      icon: 'pi pi-file',
      command: () => this.exportToCSV()
    }
  ];

  private toaster = inject(ToasterMsgService);
  private reportExportService = inject(ReportExportService);

  shopName!: string;
  shopLogoURL!: string;

  constructor(
    private _formBuilder: FormBuilder,
    private _reportsService: ReportsService,
    private _dropdownService: DropdownsService,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.prepareFilterForm();

    this._dropdownService.getBranches().subscribe(res => {
      this.branches = res.results;
    })

    // Load initial data with default current month filter
    const initialFilter = this.getFilterObject();
    this.getData(initialFilter);
  }

  prepareFilterForm() {
    // Get current month's first and last day
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.filterForm = this._formBuilder.group({
      created_from: [this.formatDate(firstDayOfMonth), Validators.required],
      created_to: [this.formatDate(lastDayOfMonth), Validators.required],
      search: null,
      branch: null
    }, { validators: this.dateRangeValidator });
  }

  // Custom validator for date range
  dateRangeValidator(formGroup: FormGroup) {
    const fromDate = formGroup.get('created_from')?.value;
    const toDate = formGroup.get('created_to')?.value;

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  formatDate(date: Date) {
    return date.toISOString().split('T')[0];
  }

  private getData(filter: {} = {}) {
    this._reportsService.getCashFlowReport(filter).subscribe({
      next: (response: CashFlowReportResponse) => {
        this.cashFlowData = response.cash_flow;
        this.currency = response.currency;
        this.shopName = response.name ?? this._authService.getUser()?.business_name ?? '-';
        this.shopLogoURL = response.logo ?? this._authService.getUser()?.image ?? '';
        this.processCashFlowToTable();
      },
      error: (error) => {
        this.toaster.showError('Failed to load cash flow data. Please try again.');
      }
    });
  }

  private processCashFlowToTable() {
    this.cashFlowTableData = [];
    if (!this.cashFlowData) return;

    // Opening Balance
    this.cashFlowTableData.push({
      description: 'Opening Balance',
      amount: this.cashFlowData.opening_balance,
      isCategory: false,
      isTotal: false
    });

    // Cash Inflow Section
    this.cashFlowTableData.push({
      description: 'Cash Inflow',
      amount: null,
      isCategory: true,
      isTotal: false
    });

    // Cash Inflow Items
    this.cashFlowData.cash_inflow.forEach(item => {
      this.cashFlowTableData.push({
        description: `${item.account_name} (${item.account_code})`,
        amount: item.debit_amount || 0,
        isCategory: false,
        isTotal: false,
        account_code: item.account_code
      });
    });

    // Cash Outflow Section
    this.cashFlowTableData.push({
      description: 'Cash Outflow',
      amount: null,
      isCategory: true,
      isTotal: false
    });

    // Cash Outflow Items
    this.cashFlowData.cash_outflow.forEach(item => {
      this.cashFlowTableData.push({
        description: `${item.account_name} (${item.account_code})`,
        amount: -(item.credit_amount || 0), // Negative for outflow
        isCategory: false,
        isTotal: false,
        account_code: item.account_code
      });
    });

    // Net Cash Flow
    this.cashFlowTableData.push({
      description: 'Net Cash Flow',
      amount: this.cashFlowData.net_cash_flow,
      isCategory: false,
      isTotal: true
    });

    // Ending Cash Balance
    this.cashFlowTableData.push({
      description: 'Ending Cash Balance',
      amount: this.cashFlowData.ending_cash_balance,
      isCategory: false,
      isTotal: true
    });
  }

  getDescriptionDisplay(row: CashFlowTableItem): string {
    if (row.isCategory) {
      return `<strong><pre>${row.description}</pre></strong>`;
    } else if (row.isTotal) {
      return `<strong>${row.description}</strong>`;
    } else {
      return `<span><pre>  ${row.description}</pre></span>`;
    }
  }

  getDescriptionForExport(row: CashFlowTableItem): string {
    if (row.isCategory) {
      return row.description;
    } else if (row.isTotal) {
      return row.description;
    } else {
      return `    ${row.description}`;
    }
  }

  getFormattedAmountForExport(row: CashFlowTableItem): string {
    if (row.amount === null) {
      return '-';
    }

    return row.amount.toFixed(3) + ' ' + this.currency;
  }

  getFormattedAmount(row: CashFlowTableItem): string {
    if (row.amount === null) {
      return '-';
    }

    let amount = row.amount.toFixed(3) + ' ' + this.currency;

    return `<strong>${amount}</strong>`
  }

  onSearch() {
    // Mark all fields as touched to show validation errors
    this.filterForm.markAllAsTouched();

    if (this.filterForm.invalid) {
      // Show alert if required date fields are missing
      if (this.filterForm.get('created_from')?.invalid || this.filterForm.get('created_to')?.invalid) {
        this.toaster.showError("Please select both From Date and To Date to filter the report.")
      }
      // Show alert if date range is invalid
      else if (this.filterForm.errors?.['dateRangeInvalid']) {
        this.toaster.showError("From Date cannot be later than To Date.")
      }
      return;
    }

    // Get the filter object and ensure it's valid
    const filterObject = this.getFilterObject();

    // Only proceed if we have valid filter data
    if (filterObject && Object.keys(filterObject).length > 0) {
      this.getData(filterObject);
    }
  }

  private getFilterObject() {
    const filterValues = { ...this.filterForm.value }; // Create a copy to avoid mutating original

    // replace created_from and created_to with created_at__range (Multiple values may be separated by commas.)
    let filter: any = {};

    if (filterValues.created_from && filterValues.created_to) {
      // Format dates as YYYY-MM-DD for backend
      const formatDateForBackend = (dateValue: string): string => {
        const date = new Date(dateValue);
        return date.toISOString().split('T')[0];
      };

      filter.created_at__range = `${formatDateForBackend(filterValues.created_from)},${formatDateForBackend(filterValues.created_to)}`;
    }

    // Remove created_from and created_to from filterValues copy
    delete filterValues.created_from;
    delete filterValues.created_to;

    // remove empty values from filterValues
    Object.keys(filterValues).forEach(key => {
      if (filterValues[key] === null || filterValues[key] === '' || filterValues[key] === undefined) {
        delete filterValues[key];
      }
    });

    const finalFilter = {
      ...filter,
      ...filterValues
    };

    return finalFilter;
  }

  // Create report configuration for the export service
  private getReportConfig(): ReportConfig {
    const reportColumns: ReportColumn[] = [
      {
        field: 'description',
        header: 'Description',
        body: (row: CashFlowTableItem) => this.getDescriptionForExport(row)
      },
      {
        field: 'amount',
        header: `Amount (${this.currency})`,
        body: (row: CashFlowTableItem) => this.getFormattedAmountForExport(row)
      }
    ];

    return {
      title: 'Cash Flow Report',
      data: this.cashFlowTableData,
      columns: reportColumns,
      filterForm: this.filterForm,
      businessName: this.shopName,
      businessLogoURL: this.shopLogoURL,
      filename: 'cash-flow-report'
    };
  }

  exportToPDF(): void {
    if (!this.cashFlowData || this.cashFlowTableData.length === 0) {
      this.toaster.showInfo('No data to export.');
      return;
    }
    this.reportExportService.exportToPDF(this.getReportConfig());
  }

  exportToExcel(): void {
    if (!this.cashFlowData || this.cashFlowTableData.length === 0) {
      this.toaster.showInfo('No data to export.');
      return;
    }
    this.reportExportService.exportToExcel(this.getReportConfig());
  }

  exportToCSV(): void {
    if (!this.cashFlowData || this.cashFlowTableData.length === 0) {
      this.toaster.showInfo('No data to export.');
      return;
    }
    this.reportExportService.exportToCSV(this.getReportConfig());
  }

  printReport(): void {
    if (!this.cashFlowData || this.cashFlowTableData.length === 0) {
      this.toaster.showInfo('No data to print.');
      return;
    }
    this.reportExportService.printReport(this.getReportConfig());
  }
}
