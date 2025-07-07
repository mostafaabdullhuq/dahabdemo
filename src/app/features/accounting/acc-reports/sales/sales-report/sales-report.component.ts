import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReportsService } from '../../../@services/reports.service';
import { SalesReportResponse, SalesReportItem } from '../sales-reports.models';
import { DataTableColumn, DataTableOptions, PaginatedResponse } from '../../../../../shared/models/common.models';
import { ToasterMsgService } from '../../../../../core/services/toaster-msg.service';
import { ReportExportService, ReportConfig, ReportColumn } from '../../../@services/report-export.service';
import { DropdownsService } from '../../../../../core/services/dropdowns.service';


@Component({
  selector: 'app-sales-report',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.scss'
})
export class SalesReportComponent implements OnInit {
  filterForm!: FormGroup;
  branches: any[] = [];
  selectedReportItem!: SalesReportItem;
  searchResults!: SalesReportResponse;
  salesData: PaginatedResponse<SalesReportItem> = {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
  tableOptions: DataTableOptions = new DataTableOptions();
  columns: DataTableColumn<SalesReportItem>[] = [
    { field: "created_at", header: "Date", body: this.getRowCreateDate },
    { field: "reference_number", header: "Invoice Number", body: (row: SalesReportItem) => row.reference_number || '-' },
    { field: "customer_name", header: "Customer Name", body: (row: SalesReportItem) => row.customer_name || '-' },
    { field: "phone", header: "Phone Number", body: (row: SalesReportItem) => row.phone || '-' },
    { field: "customer_cpr", header: "CPR Number", body: (row: SalesReportItem) => row.customer_cpr || '-' },
    { field: "subtotal", header: "Subtotal", body: this.getSubtotal.bind(this) },
    { field: "tax_amount", header: "Tax Amount", body: this.getTaxAmount.bind(this) },
    { field: "total_amount", header: "Total Amount", body: this.getRowTotalAmount.bind(this) },
  ];
  currentFilter: any = {}; // Store current filter to avoid recalculation on pagination

  reportTotals: {
    total_amount: number,
    tax_amount: number,
    subtotal: number
  } = {
      total_amount: 0,
      tax_amount: 0,
      subtotal: 0
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


  constructor(private _formBuilder: FormBuilder, private _reportsService: ReportsService, private _dropdownService: DropdownsService) { }

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
      order__customer__cpr__icontains: null,
      order__customer__name__icontains: null,
      order__customer__phone__icontains: null,
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

  getAmount(amount: string, currency: string) {
    return amount ? (+amount).toFixed(3) + ' ' + (currency || '') : '-';
  }

  getSubtotal(row: SalesReportItem) {
    return this.getAmount(row.subtotal, this.searchResults?.currency || '');
  }

  private getRowTotalAmount(row: SalesReportItem) {
    return this.getAmount(row.total_amount, this.searchResults?.currency || '');
  }

  getTaxAmount(row: SalesReportItem) {
    return this.getAmount(row.tax_amount, this.searchResults?.currency || '');
  }

  private getRowCreateDate(row: SalesReportItem) {
    if (!row?.created_at || isNaN(Date.parse(row.created_at))) return '-';
    const date = new Date(row.created_at);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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

    this._reportsService.getSalesReport(filterWithPagination).subscribe({
      next: (response) => {
        this.searchResults = response;
        this.salesData = response.sales;
        this.tableOptions.totalRecords = response.sales.count;
        this.shopName = response.name ?? '-';
        this.shopLogoURL = response.logo ?? null;
        this.updateReportTotals(response.sales.results);
      },
      error: (error) => {
        this.toaster.showError('Failed to load sales report data. Please try again.');
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

  updateReportTotals(results: SalesReportItem[] = []): void {
    const data = results ?? [];

    this.reportTotals = {
      total_amount: data.reduce((acc: number, item: SalesReportItem) => acc + parseFloat(item.total_amount || "0"), 0),
      tax_amount: data.reduce((acc: number, item: SalesReportItem) => acc + parseFloat(item.tax_amount || "0"), 0),
      subtotal: data.reduce((acc: number, item: SalesReportItem) => acc + parseFloat(item.subtotal || "0"), 0),
    };
  }

  // Create report configuration for the export service
  private getReportConfig(): ReportConfig {
    const reportColumns: ReportColumn[] = [
      { field: 'created_at', header: 'Date', body: (row: SalesReportItem) => this.getRowCreateDate(row) },
      { field: 'reference_number', header: 'Invoice Number' },
      { field: 'customer_name', header: 'Customer Name' },
      { field: 'phone', header: 'Phone' },
      { field: 'customer_cpr', header: 'CPR' },
      { field: 'subtotal', header: 'Subtotal', body: (row: SalesReportItem) => this.getSubtotal(row) },
      { field: 'tax_amount', header: 'Tax Amount', body: (row: SalesReportItem) => this.getTaxAmount(row) },
      { field: 'total_amount', header: 'Total Amount', body: (row: SalesReportItem) => this.getRowTotalAmount(row) }
    ];

    return {
      title: 'Sales Report',
      data: this.salesData.results,
      columns: reportColumns,
      totals: {
        subtotal: this.reportTotals.subtotal,
        tax_amount: this.reportTotals.tax_amount,
        total_amount: this.reportTotals.total_amount
      },
      filterForm: this.filterForm,
      businessName: this.shopName,
      businessLogoURL: this.shopLogoURL,
      filename: 'sales-report'
    };
  }

  // Export and Print Methods using the new service
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
