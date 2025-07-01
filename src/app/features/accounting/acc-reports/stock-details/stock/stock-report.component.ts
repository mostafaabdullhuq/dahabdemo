import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReportsService } from '../../../@services/reports.service';
import { StockReportResponse } from '../stock-details-reports.models';
import { DataTableColumn, DataTableOptions, PaginatedResponse } from '../../../../../shared/models/common.models';
import { ToasterMsgService } from '../../../../../core/services/toaster-msg.service';
import { ReportExportService, ReportConfig, ReportColumn } from '../../../@services/report-export.service';

@Component({
  selector: 'app-stock-report',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './stock-report.component.html',
  styleUrl: './stock-report.component.scss'
})
export class StockReportComponent implements OnInit {
  filterForm!: FormGroup;
  selectedReportItem: any;
  searchResults: PaginatedResponse<StockReportResponse> = {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
  tableOptions: DataTableOptions = new DataTableOptions();
  columns: DataTableColumn[] = [
    { field: "tag_number", header: "Tag Number", body: (row: any) => row.tag_number || '-' },
    { field: "description", header: "Description", body: (row: any) => row.description || '-' },
    { field: "category", header: "Category", body: (row: any) => row.category || '-' },
    { field: "stone_weight", header: "Stone Weight", body: (row: any) => this.getStoneWeight(row) },
    { field: "gross_weight", header: "Gross Weight", body: (row: any) => this.getGrossWeight(row) },
    { field: "pure_weight", header: "Pure Weight", body: (row: any) => row.pure_weight || '-' },
    { field: "price", header: "Price", body: (row: any) => this.getPrice(row) }
  ];
  currentFilter: any = {}; // Store current filter to avoid recalculation on pagination

  reportTotals: {
    total_stone_weight: number,
    total_gross_weight: number,
    total_price: number
  } = {
      total_stone_weight: 0,
      total_gross_weight: 0,
      total_price: 0
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
    // Get current month's first and last day
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Format dates for input fields (YYYY-MM-DD)
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    this.filterForm = this._formBuilder.group({
      created_from: [formatDate(firstDayOfMonth), Validators.required],
      created_to: [formatDate(lastDayOfMonth), Validators.required],
      category__icontains: null,
      description__icontains: null,
      tag_number__icontains: null,
      search: null,
    }, { validators: this.dateRangeValidator });

    this.businessName = JSON.parse(localStorage.getItem('user') || '{}')?.business_name;
    this.businessLogoURL = JSON.parse(localStorage.getItem('user') || '{}')?.image;

    // Load initial data with default current month filter
    const initialFilter = this.getFilterObject();
    this.getData(initialFilter);
  }

  private getStoneWeight(row: StockReportResponse) {
    return row.stone_weight ? row.stone_weight.toFixed(3) : '-';
  }

  private getGrossWeight(row: StockReportResponse) {
    return row.gross_weight ? row.gross_weight.toFixed(3) : '-';
  }

  private getPrice(row: StockReportResponse) {
    return row.price || '-';
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

    this.reportsService.getStockReport(filterWithPagination).subscribe({
      next: (response) => {
        this.searchResults = response;
        this.tableOptions.totalRecords = response.count;
        this.updateReportTotals(response.results);
      },
      error: (error) => {
        this.toaster.showError('Failed to load stock report data. Please try again.');
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

  updateReportTotals(results: any = []): void {
    const data = results ?? [];

    this.reportTotals = {
      total_stone_weight: data.reduce((acc: number, item: { stone_weight: any; }) => acc + parseFloat(item.stone_weight || 0), 0),
      total_gross_weight: data.reduce((acc: number, item: { gross_weight: any; }) => acc + parseFloat(item.gross_weight || 0), 0),
      total_price: data.reduce((acc: number, item: { price: any; }) => acc + parseFloat(item.price || 0), 0)
    };
  }

  // Create report configuration for the export service
  private getReportConfig(): ReportConfig {
    const reportColumns: ReportColumn[] = [
      { field: 'tag_number', header: 'Tag Number' },
      { field: 'description', header: 'Description' },
      { field: 'category', header: 'Category' },
      { field: 'stone_weight', header: 'Stone Weight', body: (row: StockReportResponse) => this.getStoneWeight(row) },
      { field: 'gross_weight', header: 'Gross Weight', body: (row: StockReportResponse) => this.getGrossWeight(row) },
      { field: 'pure_weight', header: 'Pure Weight' },
      { field: 'price', header: 'Price', body: (row: StockReportResponse) => this.getPrice(row) }
    ];

    return {
      title: 'Stock Report',
      data: this.searchResults.results,
      columns: reportColumns,
      totals: {
        stone_weight: this.reportTotals.total_stone_weight,
        gross_weight: this.reportTotals.total_gross_weight,
        price: this.reportTotals.total_price
      },
      filterForm: this.filterForm,
      businessName: this.businessName,
      businessLogoURL: this.businessLogoURL,
      filename: 'stock-report'
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
