import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReportsService } from '../../../@services/reports.service';
import { DropdownsService } from '../../../../../core/services/dropdowns.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { ReportExportService, ReportConfig } from '../../../@services/report-export.service';
import { DataTableColumn, DataTableOptions, PaginatedResponse } from '../../../../../shared/models/common.models';
import { GoldMovementsReportResponse, GoldMovementsTableItem, GoldMovementsTotals } from '../gold-movements-reports.models';
import { ToasterMsgService } from '../../../../../core/services/toaster-msg.service';

@Component({
  selector: 'app-gold-movements-report',
  imports: [
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './gold-movements-report.component.html',
  styleUrl: './gold-movements-report.component.scss'
})
export class GoldMovementsReportComponent implements OnInit {
  filterForm!: FormGroup;
  branches: any[] = [];
  searchResults!: GoldMovementsReportResponse;
  goldMovementsData: PaginatedResponse<GoldMovementsTableItem> = {
    results: [],
    count: 0,
    next: null,
    previous: null
  };

  tableOptions: DataTableOptions = new DataTableOptions();
  columns: DataTableColumn<GoldMovementsTableItem>[] = [
    { field: "ref_no", header: "Ref No.", body: (row: GoldMovementsTableItem) => row.ref_no || '-' },
    { field: "supplier", header: "SUPPLIER", body: (row: GoldMovementsTableItem) => row.supplier || '-' },
    { field: "customer", header: "CUSTOMER", body: (row: GoldMovementsTableItem) => row.customer || '-' },
    { field: "date", header: "DATE", body: (row: GoldMovementsTableItem) => this.formatDate(row.date) },
    { field: "description", header: "DESCRIPTION", body: (row: GoldMovementsTableItem) => row.description || '-' },
    { field: "type", header: "TTB", body: (row: GoldMovementsTableItem) => this.getTTBDisplay(row) },
    { field: "scrap_22k", header: "SCRAP 22K", body: (row: GoldMovementsTableItem) => this.getScrap22KDisplay(row) },
    { field: "scrap_21k", header: "SCRAP 21K", body: (row: GoldMovementsTableItem) => this.getScrap21KDisplay(row) },
    { field: "scrap_18k", header: "SCRAP 18K", body: (row: GoldMovementsTableItem) => this.getScrap18KDisplay(row) },
    { field: "gold_24k", header: "24K", body: (row: GoldMovementsTableItem) => this.get24KDisplay(row) },
    { field: "gold_22k", header: "22K", body: (row: GoldMovementsTableItem) => this.get22KDisplay(row) },
    { field: "gold_21k", header: "21K", body: (row: GoldMovementsTableItem) => this.get21KDisplay(row) },
    { field: "gold_18k", header: "18K", body: (row: GoldMovementsTableItem) => this.get18KDisplay(row) },
    { field: "gold_wt", header: "GOLD Wt", body: (row: GoldMovementsTableItem) => this.formatNumber(row.gold_wt) },
    { field: "gold_in", header: "GOLD IN 999", body: (row: GoldMovementsTableItem) => this.formatNumber(row.gold_in) },
    { field: "gold_out", header: "GOLD OUT 999", body: (row: GoldMovementsTableItem) => this.formatNumber(row.gold_out) },
    { field: "total_balance", header: "TOTAL BALANCE", body: (row: GoldMovementsTableItem) => this.formatNumber(row.total_balance) }
  ];

  reportTotals: GoldMovementsTotals = {
    total_records: 0,
    total_gold_in: 0,
    total_gold_out: 0,
    final_balance: 0
  };

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

  shopName!: string;
  shopLogoURL!: string;

  constructor(
    private _formBuilder: FormBuilder,
    private _reportsService: ReportsService,
    private _dropdownService: DropdownsService,
    private _authService: AuthService,
    private toaster: ToasterMsgService,
    private reportExportService: ReportExportService
  ) { }

  ngOnInit(): void {
    this.prepareFilterForm();

    this._dropdownService.getBranches().subscribe(res => {
      this.branches = res.results;
    });

    // Load initial data with default current month filter
    const initialFilter = this.getFilterObject();
    this.getData(initialFilter);
  }

  prepareFilterForm() {
    this.filterForm = this._formBuilder.group({
      search: [''],
      branch: [''],
      date_range: ['']
    }, { validators: this.dateRangeValidator });

    // Set default date range to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.filterForm.patchValue({
      date_range: [startOfMonth, endOfMonth]
    });
  }

  dateRangeValidator(formGroup: FormGroup) {
    const dateRange = formGroup.get('date_range')?.value;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      if (startDate > endDate) {
        return { invalidDateRange: true };
      }
    }
    return null;
  }

  formatDate(date: string) {
    if (!date) return '-';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  }

  formatNumber(value: number | null): string {
    if (value === null || value === undefined) return '-';
    return value.toFixed(2);
  }

  getTypeDisplay(type: string): string {
    if (!type) return '-';
    // Add success mark for certain types
    const successTypes = ['TTB', 'Scrap-18K', '24K', '18K'];
    if (successTypes.includes(type)) {
      return `<span >✓ ${type}</span>`;
    }
    return type;
  }

  // Helper methods to get checkmark display for each column
  getScrap22KDisplay(item: GoldMovementsTableItem): string {
    return item.type === 'Scrap-22K' ? `<strong >✓</strong>` : '-';
  }

  getScrap21KDisplay(item: GoldMovementsTableItem): string {
    return item.type === 'Scrap-21K' ? `<strong >✓</strong>` : '-';
  }

  getScrap18KDisplay(item: GoldMovementsTableItem): string {
    return item.type === 'Scrap-18K' ? `<strong >✓</strong>` : '-';
  }

  get24KDisplay(item: GoldMovementsTableItem): string {
    return item.type === '24K' ? `<strong >✓</strong>` : '-';
  }

  get22KDisplay(item: GoldMovementsTableItem): string {
    return item.type === '22K' ? `<strong >✓</strong>` : '-';
  }

  get21KDisplay(item: GoldMovementsTableItem): string {
    return item.type === '21K' ? `<strong>✓</strong>` : '-';
  }

  get18KDisplay(item: GoldMovementsTableItem): string {
    return item.type === '18K' ? `<strong >✓</strong>` : '-';
  }

  getTTBDisplay(item: GoldMovementsTableItem): string {
    return item.type === 'TTB' ? `<strong >✓</strong>` : '-';
  }

  // Export versions - without HTML tags
  getTTBDisplayExport(item: GoldMovementsTableItem): string {
    return item.type === 'TTB' ? '✓' : '-';
  }

  getScrap22KDisplayExport(item: GoldMovementsTableItem): string {
    return item.type === 'Scrap-22K' ? '✓' : '-';
  }

  getScrap21KDisplayExport(item: GoldMovementsTableItem): string {
    return item.type === 'Scrap-21K' ? '✓' : '-';
  }

  getScrap18KDisplayExport(item: GoldMovementsTableItem): string {
    return item.type === 'Scrap-18K' ? '✓' : '-';
  }

  get24KDisplayExport(item: GoldMovementsTableItem): string {
    return item.type === '24K' ? '✓' : '-';
  }

  get22KDisplayExport(item: GoldMovementsTableItem): string {
    return item.type === '22K' ? '✓' : '-';
  }

  get21KDisplayExport(item: GoldMovementsTableItem): string {
    return item.type === '21K' ? '✓' : '-';
  }

  get18KDisplayExport(item: GoldMovementsTableItem): string {
    return item.type === '18K' ? '✓' : '-';
  }

  private getData(filter: {} = {}) {
    this._reportsService.getGoldMovementsReport(filter).subscribe({
      next: (response) => {
        this.searchResults = response;
        this.goldMovementsData = {
          results: response.report_data || [],
          count: response.report_data?.length || 0,
          next: null,
          previous: null
        };
        this.tableOptions.totalRecords = this.goldMovementsData.count;
        this.reportTotals = response.summary;
        this.shopName = response.name;
        this.shopLogoURL = response.logo;
      },
      error: (error) => {
        this.toaster.showError('Error loading gold movements report');
        console.error('Error loading gold movements report:', error);
      }
    });
  }

  onSearch() {
    const filter = this.getFilterObject();
    this.getData(filter);
  }

  private getFilterObject() {
    const formValue = this.filterForm.value;
    const filter: any = {};

    if (formValue.search) {
      filter.search = formValue.search;
    }

    if (formValue.branch) {
      filter.branch = formValue.branch;
    }

    if (formValue.date_range && formValue.date_range[0] && formValue.date_range[1]) {
      const formatDateForBackend = (dateValue: string): string => {
        const date = new Date(dateValue);
        return date.toISOString().split('T')[0];
      };

      filter.date_from = formatDateForBackend(formValue.date_range[0]);
      filter.date_to = formatDateForBackend(formValue.date_range[1]);
    }

    return filter;
  }

  private getReportConfig(): ReportConfig {
    // Create a temporary form with the field names that the export service expects
    const tempForm = this._formBuilder.group({
      created_from: [''],
      created_to: ['']
    });

    // Extract dates from date_range and set them in the temporary form
    const dateRange = this.filterForm.get('date_range')?.value;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const formatDateForExport = (dateValue: Date): string => {
        return dateValue.toISOString().split('T')[0];
      };

      tempForm.patchValue({
        created_from: formatDateForExport(dateRange[0]),
        created_to: formatDateForExport(dateRange[1])
      });
    }

    return {
      title: 'Gold Movements Report',
      businessName: this.shopName,
      businessLogoURL: this.shopLogoURL,
      columns: [
        { field: "ref_no", header: "Ref No.", body: (row: GoldMovementsTableItem) => row.ref_no || '-' },
        { field: "supplier", header: "SUPPLIER", body: (row: GoldMovementsTableItem) => row.supplier || '-' },
        { field: "customer", header: "CUSTOMER", body: (row: GoldMovementsTableItem) => row.customer || '-' },
        { field: "date", header: "DATE", body: (row: GoldMovementsTableItem) => this.formatDate(row.date) },
        { field: "description", header: "DESCRIPTION", body: (row: GoldMovementsTableItem) => row.description || '-' },
        { field: "type", header: "TTB", body: (row: GoldMovementsTableItem) => this.getTTBDisplayExport(row) },
        { field: "scrap_22k", header: "SCRAP 22K", body: (row: GoldMovementsTableItem) => this.getScrap22KDisplayExport(row) },
        { field: "scrap_21k", header: "SCRAP 21K", body: (row: GoldMovementsTableItem) => this.getScrap21KDisplayExport(row) },
        { field: "scrap_18k", header: "SCRAP 18K", body: (row: GoldMovementsTableItem) => this.getScrap18KDisplayExport(row) },
        { field: "gold_24k", header: "24K", body: (row: GoldMovementsTableItem) => this.get24KDisplayExport(row) },
        { field: "gold_22k", header: "22K", body: (row: GoldMovementsTableItem) => this.get22KDisplayExport(row) },
        { field: "gold_21k", header: "21K", body: (row: GoldMovementsTableItem) => this.get21KDisplayExport(row) },
        { field: "gold_18k", header: "18K", body: (row: GoldMovementsTableItem) => this.get18KDisplayExport(row) },
        { field: "gold_wt", header: "GOLD Wt", body: (row: GoldMovementsTableItem) => this.formatNumber(row.gold_wt) },
        { field: "gold_in", header: "GOLD IN 999", body: (row: GoldMovementsTableItem) => this.formatNumber(row.gold_in) },
        { field: "gold_out", header: "GOLD OUT 999", body: (row: GoldMovementsTableItem) => this.formatNumber(row.gold_out) },
        { field: "total_balance", header: "TOTAL BALANCE", body: (row: GoldMovementsTableItem) => this.formatNumber(row.total_balance) }
      ],
      data: this.goldMovementsData.results,
      totals: {
        gold_in: this.reportTotals.total_gold_in,
        gold_out: this.reportTotals.total_gold_out,
        total_balance: this.reportTotals.final_balance
      },
      filterForm: tempForm,
      filename: 'gold-movements-report',
      // Configurable font sizes and orientation for better PDF layout
      headerFontSize: 8,
      rowFontSize: 7,
      orientation: 'landscape'
    };
  }

  exportToPDF(): void {
    const config = this.getReportConfig();
    this.reportExportService.exportToPDF(config);
  }

  exportToExcel(): void {
    const config = this.getReportConfig();
    this.reportExportService.exportToExcel(config);
  }

  exportToCSV(): void {
    const config = this.getReportConfig();
    this.reportExportService.exportToCSV(config);
  }

  printReport(): void {
    const config = this.getReportConfig();
    this.reportExportService.printReport(config);
  }
}
