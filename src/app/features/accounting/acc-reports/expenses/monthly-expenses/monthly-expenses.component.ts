import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReportsService } from '../../../@services/reports.service';
import { MonthlyExpensesReportResponse, MonthlyExpensesReportItem } from '../expenses-reports.models';
import { DataTableColumn, DataTableOptions, PaginatedResponse } from '../../../../../shared/models/common.models';
import { ToasterMsgService } from '../../../../../core/services/toaster-msg.service';
import { ReportExportService, ReportConfig, ReportColumn } from '../../../@services/report-export.service';
import { DropdownsService } from '../../../../../core/services/dropdowns.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-monthly-expenses',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './monthly-expenses.component.html',
  styleUrl: './monthly-expenses.component.scss'
})
export class MonthlyExpensesComponent implements OnInit {
  filterForm!: FormGroup;
  branches: any[] = [];
  selectedReportItem!: MonthlyExpensesReportItem;
  searchResults!: MonthlyExpensesReportResponse;
  expensesData: PaginatedResponse<MonthlyExpensesReportItem> = {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
  tableOptions: DataTableOptions = new DataTableOptions();
  columns: DataTableColumn<MonthlyExpensesReportItem>[] = [];
  monthlyColumns: string[] = []; // Store month keys for dynamic columns
  monthTotals: { [key: string]: number } = {}; // Store totals for each month
  currentFilter: any = {}; // Store current filter to avoid recalculation on pagination

  reportTotals: {
    total_amount: number
  } = {
      total_amount: 0
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

    this.initializeColumns();

    // Load initial data with default current year filter
    const initialFilter = this.getFilterObject();
    this.getData(initialFilter);
  }

  prepareFilterForm() {
    // Get current whole year range (January 1st to December 31st)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st
    const endOfYear = new Date(now.getFullYear(), 11, 31); // December 31st

    this.filterForm = this._formBuilder.group({
      created_from: [this.formatDate(startOfYear), Validators.required],
      created_to: [this.formatDate(endOfYear), Validators.required],
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

  initializeColumns() {
    // Initialize base columns to ensure table always has structure
    this.initializeBaseColumns();
  }

  // Initialize base columns to ensure table always has structure
  initializeBaseColumns() {
    this.columns = [
      { field: "name", header: "Expense Name", body: (row: MonthlyExpensesReportItem) => row.name || '-' }
    ];
    this.monthlyColumns = [];
    this.monthTotals = {};
  }

  // Generate dynamic columns based on actual data months
  generateColumns() {
    // Start with base columns
    this.initializeBaseColumns();

    // Extract unique months from actual data
    const uniqueMonths = new Set<string>();

    if (this.expensesData && this.expensesData.results && this.expensesData.results.length > 0) {
      this.expensesData.results.forEach(item => {
        if (item.values && item.values.length > 0) {
          item.values.forEach(value => {
            const monthKey = value.month.substr(0, 7); // YYYY-MM format
            uniqueMonths.add(monthKey);
          });
        }
      });

      // Sort months chronologically and create columns
      const sortedMonths = Array.from(uniqueMonths).sort();

      sortedMonths.forEach(monthKey => {
        const monthDisplay = new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); // Jan-25 format

        this.monthlyColumns.push(monthKey);
        this.monthTotals[monthKey] = 0;

        this.columns.push({
          field: monthKey,
          header: monthDisplay,
          body: (row: MonthlyExpensesReportItem) => this.getMonthValue(row, monthKey)
        });
      });

      // Add Total column at the end
      if (sortedMonths.length > 0) {
        this.columns.push({
          field: "total",
          header: "Total",
          body: (row: MonthlyExpensesReportItem) => this.getRowTotal(row)
        });
      }
    }
  }

  // Get value for specific month from row data
  getMonthValue(row: MonthlyExpensesReportItem, monthKey: string): string {
    if (!row.values || row.values.length === 0) return '-';

    const monthData = row.values.find(item => item.month.startsWith(monthKey));
    return monthData ? monthData.amount.toFixed(3) : '-';
  }

  // Calculate total for a specific expense category across all months
  getRowTotal(row: MonthlyExpensesReportItem): string {
    if (!row.values || row.values.length === 0) return '-';

    const total = row.values.reduce((sum, value) => {
      return sum + parseFloat(value.amount?.toString() || '0');
    }, 0);

    return total.toFixed(3);
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

    this._reportsService.getMonthlyExpensesReport(filterWithPagination).subscribe({
      next: (response) => {
        this.searchResults = response;
        this.expensesData = response.expenses;
        this.tableOptions.totalRecords = response.expenses.count;
        this.shopName = response.name ?? this._authService.getUser()?.business_name ?? '-';
        this.shopLogoURL = response.logo ?? this._authService.getUser()?.image ?? '';
        this.generateColumns();
        this.updateReportTotals(response.expenses.results);
      },
      error: (error) => {
        this.toaster.showError('Failed to load monthly expenses report data. Please try again.');
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

  updateReportTotals(results: MonthlyExpensesReportItem[] = []): void {
    const data = results ?? [];

    // Reset month totals
    this.monthTotals = {};

    // Calculate totals for each month
    data.forEach(item => {
      if (item.values && item.values.length > 0) {
        item.values.forEach(value => {
          const monthKey = value.month.substr(0, 7); // YYYY-MM format
          if (!this.monthTotals[monthKey]) {
            this.monthTotals[monthKey] = 0;
          }
          this.monthTotals[monthKey] += value.amount || 0;
        });
      }
    });

    // Calculate overall total
    this.reportTotals = {
      total_amount: Object.values(this.monthTotals).reduce((sum, amount) => sum + amount, 0)
    };
  }

  getMonthTotal(monthKey: string): string {
    return this.monthTotals[monthKey] ? this.monthTotals[monthKey].toFixed(3) : '-';
  }

  // Create report configuration for the export service
  private getReportConfig(): ReportConfig {
    const reportColumns: ReportColumn[] = [
      { field: 'name', header: 'Expense Name' }
    ];

    // Add dynamic month columns
    this.monthlyColumns.forEach(monthKey => {
      const monthDisplay = new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      reportColumns.push({
        field: monthKey,
        header: monthDisplay,
        body: (row: MonthlyExpensesReportItem) => this.getMonthValue(row, monthKey)
      });
    });

    // Add total column
    if (this.monthlyColumns.length > 0) {
      reportColumns.push({
        field: 'total',
        header: 'Total',
        body: (row: MonthlyExpensesReportItem) => this.getRowTotal(row)
      });
    }

    return {
      title: 'Monthly Expenses Report',
      data: this.expensesData.results,
      columns: reportColumns,
      totals: {
        total_amount: this.reportTotals.total_amount
      },
      filterForm: this.filterForm,
      businessName: this.shopName,
      businessLogoURL: this.shopLogoURL,
      filename: 'monthly-expenses-report'
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
