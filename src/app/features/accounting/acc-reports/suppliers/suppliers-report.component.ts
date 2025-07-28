import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { SuppliersReportResponse, SuppliersReportItem } from './suppliers.models';
import { DataTableColumn, DataTableOptions, PaginatedResponse } from '../../../../shared/models/common.models';
import { ToasterMsgService } from '../../../../core/services/toaster-msg.service';
import { ReportColumn, ReportConfig, ReportExportService } from '../../@services/report-export.service';
import { ReportsService } from '../../@services/reports.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'ap-suppliers-report',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './suppliers-report.component.html',
  styleUrl: './suppliers-report.component.scss'
})
export class SuppliersReportComponent implements OnInit {
  filterForm!: FormGroup;
  branches: any[] = [];
  selectedReportItem!: SuppliersReportItem;
  searchResults!: SuppliersReportResponse;
  suppliersData: PaginatedResponse<SuppliersReportItem> = {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
  tableOptions: DataTableOptions = new DataTableOptions();
  columns: DataTableColumn<SuppliersReportItem>[] = [
    { field: "name", header: "Supplier Name", body: (row: SuppliersReportItem) => row.name ?? '-' },
    { field: "id", header: "Reference No.", body: (row: SuppliersReportItem) => row.id?.toString() ?? '-' },
    { field: "total_due_weight", header: "Total Due Weight", body: (row: SuppliersReportItem) => row.total_due_weight ?? '-' },
    { field: "total_due_amount", header: "Total Due Amount", body: (row: SuppliersReportItem) => row.total_due_amount ?? '-' },
    { field: "advance_amount_balance", header: "Advance Amount Balance", body: (row: SuppliersReportItem) => row.advance_amount_balance ?? '-' },
    { field: "advance_weight_balance", header: "Advance Weight Balance", body: (row: SuppliersReportItem) => row.advance_weight_balance ?? '-' }
  ];
  currentFilter: any = {}; // Store current filter to avoid recalculation on pagination

  reportTotals: {
    total_due_weight: number,
    total_due_amount: number,
    advance_amount_balance: number,
    advance_weight_balance: number

  } = {
      total_due_amount: 0,
      total_due_weight: 0,
      advance_amount_balance: 0,
      advance_weight_balance: 0
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

    this._reportsService.getSuppliersReport(filterWithPagination).subscribe({
      next: (response) => {
        this.searchResults = response;
        this.suppliersData = response.suppliers;
        this.tableOptions.totalRecords = response.suppliers.count;
        this.shopName = response.name ?? this._authService.getUser()?.business_name ?? '-';
        this.shopLogoURL = response.logo ?? this._authService.getUser()?.image ?? '';
        this.updateReportTotals(response.suppliers.results);
      },
      error: (error) => {
        this.toaster.showError('Failed to load suppliers report data. Please try again.');
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

  updateReportTotals(results: SuppliersReportItem[] = []): void {
    const data = results ?? [];

    this.reportTotals = {
      total_due_weight: data.reduce((acc: number, item: SuppliersReportItem) => acc + (+item.total_due_weight || 0), 0),
      total_due_amount: data.reduce((acc: number, item: SuppliersReportItem) => acc + (+item.total_due_amount || 0), 0),
      advance_amount_balance: data.reduce((acc: number, item: SuppliersReportItem) => acc + (+item.advance_amount_balance || 0), 0),
      advance_weight_balance: data.reduce((acc: number, item: SuppliersReportItem) => acc + (+item.advance_weight_balance || 0), 0)
    };
  }

  // Create report configuration for the export service
  private getReportConfig(): ReportConfig {
    const reportColumns: ReportColumn[] = [
      { field: "name", header: "Supplier Name", body: (row: SuppliersReportItem) => row.name ?? '-' },
      { field: "id", header: "Reference No.", body: (row: SuppliersReportItem) => row.id?.toString() ?? '-' },
      { field: "total_due_weight", header: "Total Due Weight", body: (row: SuppliersReportItem) => row.total_due_weight ?? '-' },
      { field: "total_due_amount", header: "Total Due Amount", body: (row: SuppliersReportItem) => row.total_due_amount ?? '-' },
      { field: "advance_amount_balance", header: "Advance Amount Balance", body: (row: SuppliersReportItem) => row.advance_amount_balance ?? '-' },
      { field: "advance_weight_balance", header: "Advance Weight Balance", body: (row: SuppliersReportItem) => row.advance_weight_balance ?? '-' }
    ];

    return {
      title: 'Suppliers Report',
      data: this.suppliersData.results,
      columns: reportColumns,
      totals: {
        total_due_weight: this.reportTotals.total_due_weight,
        total_due_amount: this.reportTotals.total_due_amount,
        advance_amount_balance: this.reportTotals.advance_amount_balance,
        advance_weight_balance: this.reportTotals.advance_weight_balance
      },
      filterForm: this.filterForm,
      businessName: this.shopName,
      businessLogoURL: this.shopLogoURL,
      filename: 'suppliers-report'
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
