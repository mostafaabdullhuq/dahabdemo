import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReportsService } from '../../../@services/reports.service';
import { MonthlyExpensesReportResponse } from '../expenses-reports.models';
import { DataTableColumn, DataTableOptions, PaginatedResponse } from '../../../../../shared/models/common.models';
import { ToasterMsgService } from '../../../../../core/services/toaster-msg.service';
import { ReportExportService, ReportConfig, ReportColumn } from '../../../@services/report-export.service';

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
  selectedReportItem: any;
  searchResults: PaginatedResponse<MonthlyExpensesReportResponse> = {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
  tableOptions: DataTableOptions = new DataTableOptions();
  columns: DataTableColumn[] = [];
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

  businessName!: string;
  businessLogoURL!: string;

  constructor(private _formBuilder: FormBuilder, private reportsService: ReportsService) {
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

  ngOnInit(): void {
    this.initializeFilter();
    this.initializeColumns();

    this.businessName = JSON.parse(localStorage.getItem('user') || '{}')?.business_name;
    this.businessLogoURL = JSON.parse(localStorage.getItem('user') || '{}')?.image;

    // Automatically load data with default year range
    this.loadInitialData();
  }

  private loadInitialData(): void {
    // Get the default filter and load data immediately
    const defaultFilter = this.getFilterObject();

    if (defaultFilter && Object.keys(defaultFilter).length > 0) {
      // Reset pagination for initial load
      this.tableOptions.currentPage = 1;
      this.tableOptions.firstIndex = 0;

      this.getData(defaultFilter);
    }
  }

  initializeFilter() {
    // Initialize base columns immediately
    this.initializeBaseColumns();

    // Get current whole year range (January 1st to December 31st)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st
    const endOfYear = new Date(now.getFullYear(), 11, 31); // December 31st

    // Format dates for input fields (YYYY-MM-DD)
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    const startDateFormatted = formatDate(startOfYear);
    const endDateFormatted = formatDate(endOfYear);


    // Initialize form with current year range
    this.filterForm = this._formBuilder.group({
      created_from: [startDateFormatted, Validators.required],
      created_to: [endDateFormatted, Validators.required],
      search: null,
    }, { validators: this.dateRangeValidator });

  }

  initializeColumns() {
    // Initialize base columns to ensure table always has structure
    this.initializeBaseColumns();
  }

  // Initialize base columns to ensure table always has structure
  initializeBaseColumns() {
    this.columns = [
      { field: "name", header: "Expense Name" }
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

    if (this.searchResults && this.searchResults.results && this.searchResults.results.length > 0) {
      this.searchResults.results.forEach(item => {
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
          body: (row: any) => this.getMonthValue(row, monthKey)
        });
      });

      // Add Total column at the end
      if (sortedMonths.length > 0) {
        this.columns.push({
          field: "total",
          header: "Total",
          body: (row: any) => this.getRowTotal(row)
        });
      }
    }
  }

  // Get value for specific month from row data
  getMonthValue(row: MonthlyExpensesReportResponse, monthKey: string): string {
    if (!row.values || row.values.length === 0) return '-';

    const monthData = row.values.find(item => item.month.startsWith(monthKey));
    return monthData ? monthData.amount.toFixed(3) : '-';
  }

  // Calculate total for a specific expense category across all months
  getRowTotal(row: MonthlyExpensesReportResponse): string {
    if (!row.values || row.values.length === 0) return '-';

    const total = row.values.reduce((sum, value) => {
      return sum + parseFloat(value.amount?.toString() || '0');
    }, 0);
    return total > 0 ? total.toFixed(3) : '-';
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

    this.reportsService.getMonthlyExpensesReport(filterWithPagination).subscribe({
      next: (response) => {
        this.searchResults = response;
        this.tableOptions.totalRecords = response.count;
        this.generateColumns(); // Generate columns after getting data
        this.updateReportTotals(response.results);
      },
      error: (error) => {
        this.toaster.showError('Failed to load monthly expenses data. Please try again.');
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

      const fromDate = formatDateForBackend(filterValues.created_from);
      const toDate = formatDateForBackend(filterValues.created_to);
      filter.created_at__range = `${fromDate},${toDate}`;
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

  updateReportTotals(results: any = []): void {
    const data = results ?? [];

    // Reset month totals
    this.monthTotals = {};
    this.monthlyColumns.forEach(monthKey => {
      this.monthTotals[monthKey] = 0;
    });

    // Calculate totals for each month
    data.forEach((item: any) => {
      if (item.values && item.values.length > 0) {
        item.values.forEach((value: any) => {
          const monthKey = value.month.substr(0, 7); // YYYY-MM format
          if (this.monthTotals.hasOwnProperty(monthKey)) {
            this.monthTotals[monthKey] += parseFloat(value.amount || 0);
          }
        });
      }
    });

    // Calculate overall total (sum of all monthly totals)
    this.reportTotals = {
      total_amount: Object.values(this.monthTotals).reduce((acc: number, val: number) => acc + val, 0)
    };
  }

  // Get total for specific month or grand total
  getMonthTotal(monthKey: string): string {
    if (monthKey === 'total') {
      const total = this.reportTotals.total_amount || 0;
      return total > 0 ? total.toFixed(3) : '-';
    }
    const monthTotal = this.monthTotals[monthKey] || 0;
    return monthTotal > 0 ? monthTotal.toFixed(3) : '-';
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
        body: (row: MonthlyExpensesReportResponse) => this.getMonthValue(row, monthKey)
      });
    });

    // Add Total column
    if (this.monthlyColumns.length > 0) {
      reportColumns.push({
        field: 'total',
        header: 'Total',
        body: (row: MonthlyExpensesReportResponse) => this.getRowTotal(row)
      });
    }

    return {
      title: 'Monthly Expenses Report',
      data: this.searchResults.results,
      columns: reportColumns,
      totals: {
        ...this.monthTotals,
        total: this.reportTotals.total_amount,
        total_amount: this.reportTotals.total_amount
      },
      filterForm: this.filterForm,
      businessName: this.businessName,
      businessLogoURL: this.businessLogoURL,
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
