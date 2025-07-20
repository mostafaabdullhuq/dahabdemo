import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReportsService } from '../../../@services/reports.service';
import { StockAgingReportResponse, StockAgingReportResults, StockAgingReportBucket, StockAgingReportProduct } from '../stock-reports.models';
import { DataTableOptions } from '../../../../../shared/models/common.models';
import { ToasterMsgService } from '../../../../../core/services/toaster-msg.service';
import { ReportExportService, ReportConfig, ReportColumn } from '../../../@services/report-export.service';
import { DropdownsService } from '../../../../../core/services/dropdowns.service';
import { finalize } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-stock-aging-report',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ProgressSpinnerModule
  ],
  templateUrl: './stock-aging-report.component.html',
  styleUrl: './stock-aging-report.component.scss'
})
export class StockAgingReportComponent implements OnInit {
  filterForm!: FormGroup;
  branches: any[] = [];
  brands: any[] = [];
  categories: any[] = [];
  colors: any[] = [];
  designs: any[] = [];
  purities: any[] = [];
  sizes: any[] = [];
  selectedReportItem!: StockAgingReportProduct;
  agingData: StockAgingReportResults | null = null;
  tableData: any[] = [];
  rangeColumns: string[] = [];
  maxRows = 0;
  tableOptions: DataTableOptions = new DataTableOptions();
  currentFilter: any = {};
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
    this.loadDropdowns();
    this.getData(this.getFilterObject());
  }

  prepareFilterForm() {
    this.filterForm = this._formBuilder.group({
      branch: null,
      brand: null,
      category: null,
      color: null,
      country: null,
      design: null,
      max_period: null,
      period: null,
      purity: null,
      size: null
    });
  }

  loadDropdowns() {
    this._dropdownService.getBranches().subscribe((res: any) => { this.branches = res.results; });
    if (this._dropdownService.getBrands) this._dropdownService.getBrands().subscribe((res: any) => { this.brands = res.results; });
    if (this._dropdownService.getMinimalCategories) this._dropdownService.getMinimalCategories().subscribe((res: any) => { this.categories = res.results; });
    if (this._dropdownService.getColor) this._dropdownService.getColor().subscribe((res: any) => { this.colors = res.results; });
    if (this._dropdownService.getDesigners) this._dropdownService.getDesigners().subscribe((res: any) => { this.designs = res.results; });
    if (this._dropdownService.getPurities) this._dropdownService.getPurities().subscribe((res: any) => { this.purities = res.results; });
    if (this._dropdownService.getSizes) this._dropdownService.getSizes().subscribe((res: any) => { this.sizes = res.results; });
  }

  getData(filter: {} = {}) {
    this.tableData = [];
    this.rangeColumns = [];
    this.maxRows = 0;
    this._reportsService.getStockAgingReport(filter).subscribe({
      next: (response: StockAgingReportResponse) => {
        if (response && response.results && response.results.buckets) {
          this.agingData = response.results;
          this.shopName = this.agingData.branch ?? this._authService.getUser()?.business_name ?? '-';
          this.shopLogoURL = this.agingData.logo ?? this._authService.getUser()?.image ?? '';
          this.processTableData();
        } else {
          this.agingData = null;
          this.tableData = [];
          this.rangeColumns = [];
          this.maxRows = 0;
        }
      },
      error: (error) => {
        this.toaster.showError('Failed to load stock aging report data. Please try again.');
      }
    });
  }

  processTableData() {
    if (!this.agingData) return;

    // Extract range columns
    this.rangeColumns = this.agingData.buckets.map(bucket => bucket.range);
    // Find the maximum number of products in any bucket
    this.maxRows = Math.max(...this.agingData.buckets.map(bucket => bucket.products.length));
    // Create table data - each row represents a product position across all ranges
    this.tableData = [];
    for (let i = 0; i < this.maxRows; i++) {
      const row: any = { rowIndex: i };
      this.agingData.buckets.forEach(bucket => {
        const product = bucket.products[i];
        row[bucket.range] = product || null;
      });
      this.tableData.push(row);
    }
  }

  onSearch() {
    this.filterForm.markAllAsTouched();
    if (this.filterForm.invalid) return;
    this.getData(this.getFilterObject());
  }

  getFilterObject() {
    const filterValues = { ...this.filterForm.value };
    Object.keys(filterValues).forEach(key => {
      if (filterValues[key] === null || filterValues[key] === '' || filterValues[key] === undefined) {
        delete filterValues[key];
      }
    });
    return filterValues;
  }

  // Helper methods for displaying product data
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : `Category ID: ${categoryId}`;
  }

  getBranchName(branchId: number): string {
    const branch = this.branches.find(b => b.id === branchId);
    return branch ? branch.name : `Branch ID: ${branchId}`;
  }

  getBrandName(brandId: number): string {
    const brand = this.brands.find(b => b.id === brandId);
    return brand ? brand.name : `Brand ID: ${brandId}`;
  }

  getColorName(colorId: number): string {
    const color = this.colors.find(c => c.id === colorId);
    return color ? color.name : `Color ID: ${colorId}`;
  }

  getDesignName(designId: number): string {
    const design = this.designs.find(d => d.id === designId);
    return design ? design.name : `Design ID: ${designId}`;
  }

  getPurityName(purityId: number): string {
    const purity = this.purities.find(p => p.id === purityId);
    return purity ? purity.name : `Purity ID: ${purityId}`;
  }

  getSizeName(sizeId: number): string {
    const size = this.sizes.find(s => s.id === sizeId);
    return size ? size.name : `Size ID: ${sizeId}`;
  }

  getProductDisplay(product: StockAgingReportProduct): string {
    if (!product) return '';
    return `Tag Number: ${product.tag_number}\nDescription: ${product.description || 'No description'}\nCategory: ${this.getCategoryName(product.category_id)}\nPrice: ${product.price.toFixed(3)}\nStock Quantity: ${product.stock_quantity}\nBranch: ${this.getBranchName(product.branch_id)}`;
  }

  private generateExtraHeaderData(): { key: string; value: string }[] {
    const extraHeaderData: { key: string; value: string }[] = [];
    const formValues = this.filterForm.value;

    // Define field mappings with their labels and corresponding getter methods
    const fieldMappings = [
      { field: 'branch', label: 'Branch', getValue: (value: any) => this.getBranchName(value) },
      { field: 'brand', label: 'Brand', getValue: (value: any) => this.getBrandName(value) },
      { field: 'category', label: 'Category', getValue: (value: any) => this.getCategoryName(value) },
      { field: 'color', label: 'Color', getValue: (value: any) => this.getColorName(value) },
      { field: 'design', label: 'Design', getValue: (value: any) => this.getDesignName(value) },
      { field: 'purity', label: 'Purity', getValue: (value: any) => this.getPurityName(value) },
      { field: 'size', label: 'Size', getValue: (value: any) => this.getSizeName(value) },
      { field: 'country', label: 'Country', getValue: (value: any) => value },
      { field: 'max_period', label: 'Maximum Period', getValue: (value: any) => `${value} days` },
      { field: 'period', label: 'Period per Bucket', getValue: (value: any) => `${value} days` }
    ];

    // Process each field mapping
    fieldMappings.forEach(mapping => {
      const value = formValues[mapping.field];
      if (value !== null && value !== undefined && value !== '') {
        const displayValue = mapping.getValue(value);
        extraHeaderData.push({
          key: mapping.label,
          value: displayValue
        });
      }
    });

    return extraHeaderData;
  }

  // Export/Print logic
  exportToPDF(): void {
    if (!this.agingData) return this.toaster.showInfo('No data to export.');
    this.reportExportService.exportToPDF(this.getReportConfig());
  }
  exportToExcel(): void {
    if (!this.agingData) return this.toaster.showInfo('No data to export.');
    this.reportExportService.exportToExcel(this.getReportConfig());
  }
  exportToCSV(): void {
    if (!this.agingData) return this.toaster.showInfo('No data to export.');
    this.reportExportService.exportToCSV(this.getReportConfig());
  }
  printReport(): void {
    if (!this.agingData) return this.toaster.showInfo('No data to print.');
    this.reportExportService.printReport(this.getReportConfig());
  }

  private getReportConfig(): ReportConfig {
    // Create columns for each range
    const columns: ReportColumn[] = this.rangeColumns.map(range => ({
      field: range,
      header: `${range} Days`,
      body: (row: any) => {
        const product = row[range];
        return product ? this.getProductDisplay(product) : '';
      }
    }));

    // Create export data
    const exportData = this.tableData.filter(row =>
      this.rangeColumns.some(range => row[range] !== null)
    );

    // Generate extra header data with human-readable values
    const extraHeaderData = this.generateExtraHeaderData();

    return {
      title: 'Stock Aging Report',
      data: exportData,
      columns,
      totals: {},
      filterForm: this.filterForm,
      businessName: this.shopName,
      businessLogoURL: this.shopLogoURL,
      filename: 'stock-aging-report',
      extraHeaderData: extraHeaderData.length > 0 ? extraHeaderData : undefined
    };
  }
}
