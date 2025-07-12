import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReportsService } from '../../../@services/reports.service';
import { VatsDataReportResponse, VatsDataReportItem } from '../vats-reports.models';
import { DataTableColumn, DataTableOptions, PaginatedResponse } from '../../../../../shared/models/common.models';
import { ToasterMsgService } from '../../../../../core/services/toaster-msg.service';
import { ReportExportService, ReportConfig, ReportColumn } from '../../../@services/report-export.service';
import { DropdownsService } from '../../../../../core/services/dropdowns.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-vat-data-report',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './vat-data-report.component.html',
  styleUrl: './vat-data-report.component.scss'
})
export class VatDataReportComponent implements OnInit {
  filterForm!: FormGroup;
  branches: any[] = [];
  selectedReportItem!: VatsDataReportItem;
  searchResults!: VatsDataReportResponse;
  vatsData: PaginatedResponse<VatsDataReportItem> = {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
  tableOptions: DataTableOptions = new DataTableOptions();
  columns: DataTableColumn<VatsDataReportItem>[] = [
    { field: "description", header: "Description", body: (row: VatsDataReportItem) => row.description || '-' },
    { field: "tax_code", header: "Tax Code", body: (row: VatsDataReportItem) => row.tax_code?.toString() || '-' },
    { field: "tax_name", header: "Tax Name", body: (row: VatsDataReportItem) => row.tax_name?.toString() || '-' },
    { field: "document_date", header: "Document Date", body: (row: VatsDataReportItem) => this.getFormattedDate(row.document_date) },
    { field: "document_number", header: "Document Number", body: (row: VatsDataReportItem) => row.document_number || '-' },
    { field: "voucher_type_name", header: "Voucher Type", body: (row: VatsDataReportItem) => row.voucher_type_name || '-' },
    { field: "account_name", header: "Account Name", body: (row: VatsDataReportItem) => row.account_name || '-' },
    { field: "tin_number", header: "TIN Number", body: (row: VatsDataReportItem) => row.tin_number || '-' },
    { field: "tax_amount", header: "Tax Amount", body: (row: VatsDataReportItem) => this.getTaxAmount(row) },
    { field: "gross_amount", header: "Gross Amount", body: (row: VatsDataReportItem) => this.getGrossAmount(row) }
  ];
  currentFilter: any = {}; // Store current filter to avoid recalculation on pagination

  reportTotals: {
    tax_amount: number,
    gross_amount: number
  } = {
      tax_amount: 0,
      gross_amount: 0
    }

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

  private getFormattedDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  private getTaxAmount(row: VatsDataReportItem) {
    return row.tax_amount ? row.tax_amount.toFixed(3) : '-';
  }

  private getGrossAmount(row: VatsDataReportItem) {
    return row.gross_amount ? row.gross_amount.toFixed(3) : '-';
  }

  getPaginatedRows(data: { first: number, rows: number }) {
    this.tableOptions.firstIndex = data.first;
    this.tableOptions.pageSize = data.rows;

    // Calculate the current page based on first index and rows per page
    this.tableOptions.currentPage = Math.floor(data.first / data.rows) + 1;

    // Use stored filter to prevent undefined values during rapid pagination
    // If no stored filter exists, use current form values as fallback
    const filterToUse = (this.currentFilter && Object.keys(this.currentFilter).length > 0)
      ? this.currentFilter
      : this.getFilterObject();

    this.getData(filterToUse);
  }

  private getData(filter: {} = {}) {
    // Store the filter for pagination use, but add page info
    const filterWithPagination = {
      ...filter,
      page: this.tableOptions.currentPage,
      page_size: this.tableOptions.pageSize,
    };

    // Store the base filter (without pagination) for future pagination calls
    if (Object.keys(filter).length > 0) {
      this.currentFilter = { ...filter };
    }

    this._reportsService.getVatsDataReport(filterWithPagination).subscribe({
      next: (response) => {
        this.searchResults = response;
        this.vatsData = response.vats;
        this.tableOptions.totalRecords = response.vats.count;
        this.shopName = response.name ?? this._authService.getUser()?.business_name ?? '-';
        this.shopLogoURL = response.logo ?? this._authService.getUser()?.image ?? '';
        this.updateReportTotals(response.vats.results);
      },
      error: (error) => {
        this.toaster.showError('Failed to load VAT data report. Please try again.');
      }
    });
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
      // Reset to first page when searching
      this.tableOptions.currentPage = 1;
      this.tableOptions.firstIndex = 0;

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

  updateReportTotals(results: VatsDataReportItem[] = []): void {
    const data = results ?? [];

    this.reportTotals = {
      tax_amount: data.reduce((acc: number, item: VatsDataReportItem) => acc + (item.tax_amount || 0), 0),
      gross_amount: data.reduce((acc: number, item: VatsDataReportItem) => acc + (item.gross_amount || 0), 0)
    };
  }

  // Create report configuration for the export service
  private getReportConfig(): ReportConfig {
    const reportColumns: ReportColumn[] = [
      { field: 'description', header: 'Description' },
      { field: 'tax_code', header: 'Tax Code' },
      { field: 'tax_name', header: 'Tax Name' },
      { field: 'document_date', header: 'Document Date', body: (row: VatsDataReportItem) => this.getFormattedDate(row.document_date) },
      { field: 'document_number', header: 'Document Number' },
      { field: 'voucher_type_name', header: 'Voucher Type' },
      { field: 'account_name', header: 'Account Name' },
      { field: 'tin_number', header: 'TIN Number' },
      { field: 'tax_amount', header: 'Tax Amount', body: (row: VatsDataReportItem) => this.getTaxAmount(row) },
      { field: 'gross_amount', header: 'Gross Amount', body: (row: VatsDataReportItem) => this.getGrossAmount(row) }
    ];

    return {
      title: 'VAT Data Report',
      data: this.vatsData.results,
      columns: reportColumns,
      totals: {
        tax_amount: this.reportTotals.tax_amount,
        gross_amount: this.reportTotals.gross_amount
      },
      filterForm: this.filterForm,
      businessName: this.shopName,
      businessLogoURL: this.shopLogoURL,
      filename: 'vat-data-report'
    };
  }

  // Export and Print Methods using the service
  exportToPDF(): void {
    this.reportExportService.exportToPDF(this.getReportConfig());
  }

  exportToExcel(): void {
    this.reportExportService.exportToExcel(this.getReportConfig());
  }

  exportToCSV(): void {
    this.reportExportService.exportToCSV(this.getReportConfig());
  }

  printReport(): void {
    this.reportExportService.printReport(this.getReportConfig());
  }
}
