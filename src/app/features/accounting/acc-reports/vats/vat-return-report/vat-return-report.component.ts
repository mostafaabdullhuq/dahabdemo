import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReportsService } from '../../../@services/reports.service';
import { VatsReturnReportResponse, VatsReturnReportItem } from '../vats-reports.models';
import { DataTableColumn, DataTableOptions } from '../../../../../shared/models/common.models';
import { ToasterMsgService } from '../../../../../core/services/toaster-msg.service';
import { ReportExportService, ReportConfig, ReportColumn } from '../../../@services/report-export.service';
import { DropdownsService } from '../../../../../core/services/dropdowns.service';
import { AuthService } from '../../../../../core/services/auth.service';

export interface VatReturnTableRow {
  category: string;
  description: string;
  amount: number | null;
  vat_amount: number | null;
  isSubtotal?: boolean;
  rowspan: any;
}

@Component({
  selector: 'app-vat-return-report',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './vat-return-report.component.html',
  styleUrl: './vat-return-report.component.scss'
})
export class VatReturnReportComponent implements OnInit {
  filterForm!: FormGroup;
  branches: any[] = [];
  searchResults!: VatsReturnReportResponse;
  currency: string = "";
  vatsData: {
    sales: VatsReturnReportItem[];
    purchase: VatsReturnReportItem[];
    totals: VatsReturnReportItem[];
  } = {
      sales: [],
      purchase: [],
      totals: []
    };
  tableOptions: DataTableOptions = new DataTableOptions();
  salesColumns: DataTableColumn<VatsReturnReportItem>[] = [
    { field: "description", header: "Description", body: (row: VatsReturnReportItem) => row.description || '-' },
    { field: "amount", header: "Amount", body: (row: VatsReturnReportItem) => this.getAmount(row) },
    { field: "vat_amount", header: "VAT Amount", body: (row: VatsReturnReportItem) => this.getVatAmount(row) }
  ];
  purchaseColumns: DataTableColumn<VatsReturnReportItem>[] = [
    { field: "description", header: "Description", body: (row: VatsReturnReportItem) => row.description || '-' },
    { field: "amount", header: "Amount", body: (row: VatsReturnReportItem) => this.getAmount(row) },
    { field: "vat_amount", header: "VAT Amount", body: (row: VatsReturnReportItem) => this.getVatAmount(row) }
  ];
  totalsColumns: DataTableColumn<VatsReturnReportItem>[] = [
    { field: "description", header: "Description", body: (row: VatsReturnReportItem) => row.description || '-' },
    { field: "amount", header: "Amount", body: (row: VatsReturnReportItem) => this.getAmount(row) },
    { field: "vat_amount", header: "VAT Amount", body: (row: VatsReturnReportItem) => this.getVatAmount(row) }
  ];

  reportTotals: {
    sales_amount: number,
    sales_vat_amount: number,
    purchase_amount: number,
    purchase_vat_amount: number,
    total_amount: number,
    total_vat_amount: number
  } = {
      sales_amount: 0,
      sales_vat_amount: 0,
      purchase_amount: 0,
      purchase_vat_amount: 0,
      total_amount: 0,
      total_vat_amount: 0
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

  getAmount(row: { amount: number | null }) {
    return typeof row.amount === 'number' ? row.amount.toFixed(3) : '-';
  }

  getVatAmount(row: { vat_amount: number | null }) {
    return typeof row.vat_amount === 'number' ? row.vat_amount.toFixed(3) : '-';
  }

  private getData(filter: {} = {}) {
    this._reportsService.getVatsReturnReport(filter).subscribe({
      next: (response: VatsReturnReportResponse) => {
        this.searchResults = response;
        this.vatsData = response.vats;
        this.shopName = response.name ?? this._authService.getUser()?.business_name ?? '-';
        this.shopLogoURL = response.logo ?? this._authService.getUser()?.image ?? '';
        this.currency = response.currency;

        this.updateReportTotals();
      },
      error: (error: any) => {
        this.toaster.showError('Failed to load VAT return report. Please try again.');
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

  updateReportTotals(): void {
    this.reportTotals = {
      sales_amount: this.vatsData.sales.reduce((acc: number, item: VatsReturnReportItem) => acc + (item.amount || 0), 0),
      sales_vat_amount: this.vatsData.sales.reduce((acc: number, item: VatsReturnReportItem) => acc + (item.vat_amount || 0), 0),
      purchase_amount: this.vatsData.purchase.reduce((acc: number, item: VatsReturnReportItem) => acc + (item.amount || 0), 0),
      purchase_vat_amount: this.vatsData.purchase.reduce((acc: number, item: VatsReturnReportItem) => acc + (item.vat_amount || 0), 0),
      total_amount: this.vatsData.totals.reduce((acc: number, item: VatsReturnReportItem) => acc + (item.amount || 0), 0),
      total_vat_amount: this.vatsData.totals.reduce((acc: number, item: VatsReturnReportItem) => acc + (item.vat_amount || 0), 0)
    };
  }

  get tableRows(): VatReturnTableRow[] {
    // Build the table rows with category and rowspans
    const rows: VatReturnTableRow[] = [];

    // Helper to push group with subtotal
    function pushGroup(category: string, items: VatsReturnReportItem[], subtotalLabel: string, subtotalAmount: number, subtotalVat: number) {
      if (!items.length) return;
      const groupRows = items.map((item, idx) => ({
        category: idx === 0 ? category : '',
        description: item.description,
        amount: item.amount,
        vat_amount: item.vat_amount,
        isSubtotal: false,
        rowspan: 0
      }));
      // Add subtotal row
      groupRows.push({
        category: '',
        description: subtotalLabel,
        amount: subtotalAmount,
        vat_amount: subtotalVat,
        isSubtotal: true,
        rowspan: 0
      });
      // Set rowspan for the first row
      groupRows[0].rowspan = groupRows.length > 1 ? groupRows.length : 0;
      rows.push(...groupRows);
    }

    // Sales
    pushGroup(
      'Sales',
      this.vatsData.sales,
      'Total sales',
      this.reportTotals.sales_amount,
      this.reportTotals.sales_vat_amount
    );
    // Purchase
    pushGroup(
      'Purchase',
      this.vatsData.purchase,
      'Total Purchase',
      this.reportTotals.purchase_amount,
      this.reportTotals.purchase_vat_amount
    );
    // Totals (no subtotal row, just all rows with category 'Totals')
    if (this.vatsData.totals.length) {
      this.vatsData.totals.forEach((item, idx) => {
        rows.push({
          category: idx === 0 ? 'Totals' : '',
          description: item.description,
          amount: item.amount,
          vat_amount: item.vat_amount,
          isSubtotal: false,
          rowspan: idx === 0 ? this.vatsData.totals.length : null
        });
      });
    }
    return rows;
  }

  // Create report configuration for the export service
  private getReportConfig(): ReportConfig {
    const currency = this.currency || '';
    const reportColumns: ReportColumn[] = [
      {
        field: 'category',
        header: 'Category',
        body: (row: VatReturnTableRow) => row.category
      },
      {
        field: 'description',
        header: 'Description',
        body: (row: VatReturnTableRow) => row.description
      },
      {
        field: 'amount',
        header: `Amount ${currency}`,
        body: (row: VatReturnTableRow) =>
          typeof row.amount === 'number' ? row.amount.toFixed(3) : '-',
      },
      {
        field: 'vat_amount',
        header: `Vat Amount ${currency}`,
        body: (row: VatReturnTableRow) =>
          typeof row.vat_amount === 'number' ? row.vat_amount.toFixed(3) : '-',
      }
    ];

    return {
      title: 'VAT Return Report',
      data: this.tableRows,
      columns: reportColumns,
      totals: {
        sales_amount: this.reportTotals.sales_amount,
        sales_vat_amount: this.reportTotals.sales_vat_amount,
        purchase_amount: this.reportTotals.purchase_amount,
        purchase_vat_amount: this.reportTotals.purchase_vat_amount,
        total_amount: this.reportTotals.total_amount,
        total_vat_amount: this.reportTotals.total_vat_amount
      },
      filterForm: this.filterForm,
      businessName: this.shopName,
      businessLogoURL: this.shopLogoURL,
      filename: 'vat-return-report'
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
