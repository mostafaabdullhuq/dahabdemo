import { Component, ComponentRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccService } from '../@services/acc.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { SharedModule } from '../../../shared/shared.module';
import { MenuItem } from 'primeng/api';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { ViewTransPaymentComponent } from './view-trans-payment/view-trans-payment.component';
import { AddTransPaymentComponent } from './add-trans-payment/add-trans-payment.component';

@Component({
  selector: 'app-transactions',
  imports: [SharedModule, RouterLink],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent {
  transactions: any[] = [];
  transactionTypes: any[] = [
    {
      id: "", name: 'All'
    },
    {
      id: "sale", name: 'Sales'
    },
    {
      id: "purchase", name: 'Purchase Old Gold'
    },
    {
      id: "return", name: 'Return'
    },
    {
      id: "repair", name: 'Repair'
    },
    {
      id: "gold_receipt", name: 'Gold Receipt'
    }
  ];
  cols: any[] = [];
  filterForm!: FormGroup;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;
  customers: any = [];
  branches: any = [];
  paymentStatusOptions = [
    { id: 'due', name: 'Due' },
    { id: 'paid', name: 'Paid' },
    { id: 'partially_paid', name: 'Partially Paid' }
  ];
  paymentMethods: any = [];
  componentRef!: ComponentRef<any>;
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;


  constructor(
    private _accService: AccService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _dropdownService: DropdownsService,
    private _confirmPopUp: ConfirmationPopUpService
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: "invoice_number", header: "Invoice Number" },
      {
        field: "created_at", header: "Date",
        body: (row: any) => {
          if (!row?.created_at || isNaN(Date.parse(row.created_at))) return '-';
          const date = new Date(row.created_at);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
      },
      { field: "payment_method", header: "Payment Method" },
      {
        field: "payment_status", header: "Payment Status",
        body: (row: any) => {
          const status = row?.payment_status;
          let className = 'badge text-secondary';
          let label = status?.replace('_', ' ') ?? 'Unknown';

          switch (status) {
            case 'due':
              className = 'badge rounded-pill text-bg-warning'; break;
            case 'paid':
              className = 'badge rounded-pill text-bg-success'; break;
            case 'partially_paid':
              className = 'badge rounded-pill text-bg-danger'; break;
          }

          return `<span class="${className}">${label}</span>`;
        },
        escape: false
      },
      { field: "amount", header: "Total Amount", body: (row: any) => +row.amount },
      { field: "sub_total", header: "SubTotal", body: (row: any) => +row.sub_total },
      { field: "tax", header: "Tax", body: (row: any) => +row.tax },
      { field: "total_paid", header: "Total Paid", body: (row: any) => +row.total_paid },
      { field: "remaining_amount", header: "Remaining", body: (row: any) => +row.remaining_amount },
      { field: "salesman_name", header: "Salesman" },
      { field: "customer_name", header: "Customer" },
      { field: "orderproduct_count", header: "Total Items" },
      { field: "total_weight", header: "Total Weight" },
      { field: "transaction_type", header: "Transaction Type" },
    ];
    // Get current month's first and last day
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);


    this.filterForm = this._formBuilder.group({
      search: '',
      transaction_type: '',
      order__customer: '',
      order__payment_start_date: [firstDayOfMonth],
      order__payment_end_date: [lastDayOfMonth],
      order__payment_method: '',
      order__status: '',
      shift__branch: ''
    }, { validators: this.dateRangeValidator });
    this.getTransactions();
    this._dropdownService.getCustomers().subscribe(data => {
      this.customers = data?.results;
    });
    this._dropdownService.getPaymentMethods().subscribe(res => {
      this.paymentMethods = res?.results
    });
    this._dropdownService.getBranches().subscribe(res => {
      this.branches = res?.results;
    })
  }

  // Custom validator for date range
  dateRangeValidator(formGroup: FormGroup) {
    const fromDate = formGroup.get('order__payment_start_date')?.value;
    const toDate = formGroup.get('order__payment_end_date')?.value;

    if ((fromDate && !toDate) || (!fromDate && toDate) || (fromDate && toDate && new Date(fromDate) > new Date(toDate))) {
      return { dateRangeInvalid: true };
    }

    return null;
  }

  formatDate(date: Date) {
    return date.toISOString().split('T')[0];
  }

  // Get transactions with filtering and pagination
  getTransactions(search: any = '', page: number = 1, pageSize: number = 10): void {
    const filterValues = this.filterForm?.value || {};
    const queryParts: string[] = [];

    if (filterValues.search) {
      queryParts.push(`search=${encodeURIComponent(filterValues.search)}`);
    }
    if (filterValues.transaction_type) {
      queryParts.push(`transaction_type=${encodeURIComponent(filterValues.transaction_type)}`);
    }
    if (filterValues.order__customer) {
      queryParts.push(`order__customer=${encodeURIComponent(filterValues.order__customer)}`);
    }

    if (filterValues.order__payment_start_date || filterValues.order__payment_end_date) {
      let dateRange = ""
      if (filterValues.order__payment_start_date) {
        let date = new Date(filterValues.order__payment_start_date);
        date.setDate(date.getDate() + 1);
        dateRange += date.toISOString().split('T')[0];
      }

      if (filterValues.order__payment_end_date) {
        let date = new Date(filterValues.order__payment_end_date);
        date.setDate(date.getDate() + 1);
        dateRange += `,${date.toISOString().split('T')[0]}`;
      }

      queryParts.push(`order__payment_date__range=${encodeURIComponent(dateRange)}`);
    }

    if (filterValues.order__payment_method) {
      queryParts.push(`order__payment_method=${encodeURIComponent(filterValues.order__payment_method)}`);
    }
    if (filterValues.order__status) {
      queryParts.push(`order__status=${encodeURIComponent(filterValues.order__status)}`);
    }
    if (filterValues.shift__branch) {
      queryParts.push(`shift__branch=${encodeURIComponent(filterValues.shift__branch)}`);
    }

    // Add pagination params
    queryParts.push(`page=${page}`);
    queryParts.push(`page_size=${pageSize}`);

    const params = queryParts.join('&');

    this._accService.getTransactions(params).subscribe(res => {
      this.transactions = res?.results;
      this.totalRecords = res?.count;
      this.updateRowsPerPageOptions(res?.count);
      this.updateTotals();

    });
  }

  loadTransactions(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;

    this._accService.getTransactions(this.filterForm?.value?.search || '', page, pageSize)
      .subscribe((res) => {
        this.transactions = res.results;
        this.totalRecords = res.count;
        this.updateRowsPerPageOptions(res?.count);
        this.updateTotals();
      });
  }

  selectedTransaction: any;
  footerValues: { [key: string]: any } = {};

  totals = {
    amount: 0,
    sub_total: 0,
    total_paid: 0,
    remaining_amount: 0,
    total_weight: 0
  };

  updateTotals(): void {
    const data = this.transactions || [];

    this.totals = {
      amount: data.reduce((acc: number, item: { amount: any; }) => acc + parseFloat(item.amount || 0), 0),
      sub_total: data.reduce((acc: number, item: { sub_total: any; }) => acc + parseFloat(item.sub_total || 0), 0),
      total_paid: data.reduce((acc: number, item: { total_paid: any; }) => acc + parseFloat(item.total_paid || 0), 0),
      remaining_amount: data.reduce((acc: number, item: { remaining_amount: any; }) => acc + parseFloat(item.remaining_amount || 0), 0),
      total_weight: data.reduce((acc: number, item: { total_weight: any; }) => acc + parseFloat(item.total_weight || 0), 0)
    };
  }
  transactionsMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editTransaction(this.selectedTransaction)
    },
    {
      label: 'Add Payment',
      icon: 'pi pi-wallet',
      command: () => this.openAddPayment(this.selectedTransaction?.id)
    },
    {
      label: 'View Payment',
      icon: 'pi pi-eye',
      command: () => this.openViewPayment(this.selectedTransaction?.id)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedTransaction)
    }

  ];

  editTransaction(user: any) {
    this._router.navigate([`acc/transaction/edit/${user?.id}`]);
  }

  deleteTransaction(user: any) {
    this._accService.deleteTransaction(user?.id).subscribe(res => {
      this.getTransactions()
    })
  }

  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteTransaction(user);
      },
      target: user?.id
    });
  }

  onSearch(): void {
    const formValues = this.filterForm.value;

    const queryParts: string[] = [];

    Object.keys(formValues).forEach(key => {
      const value = formValues[key];
      if (value !== null && value !== '' && value !== undefined) {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(value).replace(/%20/g, '+'); // Replace space with +
        queryParts.push(`${encodedKey}=${encodedValue}`);
      }
    });

    const queryParams = queryParts.join('&');

    this.getTransactions(queryParams, 1, 10);
  }

  openViewPayment(id: any) {
    this.container.clear();
    this.componentRef = this.container.createComponent(ViewTransPaymentComponent);
    this.componentRef.instance.showDialog();
    this.componentRef.instance.transId = id
  }

  openAddPayment(id: any) {
    this.container.clear();
    this.componentRef = this.container.createComponent(AddTransPaymentComponent);
    this.componentRef.instance.showDialog();
    this.componentRef.instance.transId = id
  }

  rowsPerPageOptions: any[] = [10, 25, 50]; // initially

  updateRowsPerPageOptions(total: number): void {
    this.rowsPerPageOptions = [10, 25, 50, total];
  }
}
