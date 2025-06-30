import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../../../shared/shared.module';
import {ReportsService} from '../../../@services/reports.service';
import {SalesReportResponse} from '../sales-reports.models';
import {DataTableColumn, DataTableOptions, PaginatedResponse} from '../../../../../shared/models/common.models';


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
  selectedReportItem: any;
  searchResults: PaginatedResponse<SalesReportResponse> = {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
  tableOptions: DataTableOptions = new DataTableOptions();
  columns: DataTableColumn[] = [
    {field: "created_at", header: "Date", body: this.getRowCreateDate},
    {field: "reference_number", header: "Invoice Number"},
    {field: "customer_name", header: "Customer Name"},
    {field: "phone", header: "Phone Number"},
    {field: "customer_cpr", header: "CPR Number"},
    {field: "subtotal", header: "Subtotal", body: this.getSubtotal.bind(this)},
    {field: "tax_amount", header: "Tax Amount", body: this.getTaxAmount.bind(this)},
    {field: "total_amount", header: "Total Amount", body: this.getRowTotalAmount.bind(this)},
  ];

  reportTotals!: {
    total_amount: number,
    tax_amount: number,
    subtotal: number
  }

  constructor(private _formBuilder: FormBuilder, private reportsService: ReportsService) {
  }

  ngOnInit(): void {
    this.filterForm = this._formBuilder.group({
      created_from: null,
      created_to: null,
      order__customer__cpr__icontains: null,
      order__customer__name__icontains: null,
      order__customer__phone__icontains: null,
      search: null,
    });

    this.getData()
  }


  getAmount(amount: string, currency: string) {
    return (+amount)?.toFixed(3) + ' ' + currency;
  }

  getSubtotal(row: SalesReportResponse) {
    return this.getAmount(row.subtotal, row.currency);
  }

  private getRowTotalAmount(row: SalesReportResponse) {
    return this.getAmount(row.total_amount, row.currency);
  }

  getTaxAmount(row: SalesReportResponse) {
    return this.getAmount(row.tax_amount, row.currency);
  }

  private getRowCreateDate(row: SalesReportResponse) {
    if (!row?.created_at || isNaN(Date.parse(row.created_at))) return '-';
    const date = new Date(row.created_at);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
  }

  getPaginatedRows(data: { first: number, rows: number }) {
    this.tableOptions.firstIndex = data.first;
    this.tableOptions.pageSize = data.rows;

    // Calculate the current page based on first index and rows per page
    this.tableOptions.currentPage = Math.floor(data.first / data.rows) + 1;

    this.getData();
  }

  private getData(filter: {} = {}) {
    this.reportsService.getSalesReport({
      ...filter,
      page: this.tableOptions.currentPage,
      page_size: this.tableOptions.pageSize,
    }).subscribe(response => {
      this.searchResults = response;
      this.tableOptions.totalRecords = response.count;
    this.updateReportTotals(response.results);
    });
  }

  onSearch() {
    if (this.filterForm.invalid) {
      return;
    }

    this.getData(this.getFilterObject());
  }

  private getFilterObject() {
    const filterValues = this.filterForm.value;

    // replace created_from and created_to with created_at__range (Multiple values may be separated by commas.)
    let filter: any = {};

    if (filterValues.created_from && filterValues.created_to) {
      filter.created_at__range = `${new Date(filterValues.created_from).toISOString()},${new Date(filterValues.created_to).toISOString()}`;
    }

    // Remove created_from and created_to from filterValues
    delete filterValues.created_from;
    delete filterValues.created_to;

    // remove empty values from filterValues
    Object.keys(filterValues).forEach(key => {
      if (filterValues[key] === null || filterValues[key] === '' || filterValues[key] === undefined) {
        delete filterValues[key];
      }
    });

    return {
      ...filter,
      ...filterValues,
      page: this.tableOptions.currentPage,
      page_size: this.tableOptions.pageSize
    }
  }

  updateReportTotals(results: any = []): void {
  const data = results ?? [];

  this.reportTotals = {
    total_amount: data.reduce((acc: number, item: { total_amount: any; }) => acc + parseFloat(item.total_amount || 0), 0),
    tax_amount: data.reduce((acc: number, item: { tax_amount: any; }) => acc + parseFloat(item.tax_amount || 0), 0),
    subtotal: data.reduce((acc: number, item: { subtotal: any; }) => acc + parseFloat(item.subtotal || 0), 0),
  };
}
}
