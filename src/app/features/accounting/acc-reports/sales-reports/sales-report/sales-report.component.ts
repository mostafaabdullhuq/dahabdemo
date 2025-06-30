import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../../../shared/shared.module';
import {ReportsService} from '../../../@services/reports.service';
import {SalesReportResponse} from '../sales-reports.models';
import {DataTableOptions, PaginatedResponse} from '../../../../../shared/models/common.models';

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
  firstIndex: number = 0
  tableOptions: DataTableOptions = new DataTableOptions();

  constructor(private _formBuilder: FormBuilder, private reportsService: ReportsService) {
  }

  ngOnInit(): void {
    this.filterForm = this._formBuilder.group({
      created_at__range: "",
      order__customer__cpr__icontains: "",
      order__customer__name__icontains: "",
      order__customer__phone__icontains: "",
      page: "",
      page_size: "",
      search: "",
    });

    this.reportsService.getSalesReport().subscribe(results => {
      this.searchResults = results;
      this.tableOptions.totalRecords = results.count;
    });
  }

  getPaginatedRows(data: { first: number, rows: number }) {
    this.tableOptions.firstIndex = data.first;
    this.tableOptions.currentPage = Math.floor(data.first / data.rows) + 1; // Calculate the current page based on first index and rows per page

    console.log('Fetching paginated rows for page:', this.tableOptions.currentPage, 'with rows:', data.rows);

    // this.reportsService.getSalesReport();

    // const filterValues = this.filterForm?.value || {};
    // const queryString: string[] = [];
    //
    // if (filterValues.search) {
    //   queryString.push(`search=${encodeURIComponent(filterValues.search)}`);
    // }
    // if (filterValues.transaction_type) {
    //   queryString.push(`transaction_type=${encodeURIComponent(filterValues.transaction_type)}`);
    // }
    // if (filterValues.order__customer) {
    //   queryString.push(`order__customer=${encodeURIComponent(filterValues.order__customer)}`);
    // }
    // if (filterValues.order__payment_date) {
    //   const date = new Date(filterValues.order__payment_date);
    //   const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    //   queryString.push(`order__payment_date=${encodeURIComponent(formattedDate)}`);
    // }
    // if (filterValues.order__payment_method) {
    //   queryString.push(`order__payment_method=${encodeURIComponent(filterValues.order__payment_method)}`);
    // }
    // if (filterValues.order__status) {
    //   queryString.push(`order__status=${encodeURIComponent(filterValues.order__status)}`);
    // }
    // if (filterValues.shift__branch) {
    //   queryString.push(`shift__branch=${encodeURIComponent(filterValues.shift__branch)}`);
    // }
    //
    // // Add pagination params
    // queryString.push(`page=${page}`);
    // queryString.push(`page_size=${pageSize}`);
    //
    // const params = queryString.join('&');

    // this._accService.getTransactions(params).subscribe(res => {
    //   this.transactions = res?.results;
    //   this.totalRecords = res?.count;
    //   this.updateRowsPerPageOptions(res?.count);
    //   this.updateTotals();
    //
    // });
  }


  updateRowsPerPageOptions(total: number): void {
    this.tableOptions.rowsPerPageOptions = [...this.tableOptions.rowsPerPageOptions, total];
  }
}
