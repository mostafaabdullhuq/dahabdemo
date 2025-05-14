import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AccService } from '../@services/acc.service';
import { Router } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { SharedModule } from '../../../shared/shared.module';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-transactions',
  imports: [SharedModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent {
  transactions: any[] = [];
  transactionTypes: any[] = [
     {
    id: "", name:'All'
  },
  {
    id: "sale", name:'Sales'
  },
  {
    id: "purchase", name:'Purchase Old Gold'
  },
  {
    id: "return", name:'Return'
  },
  {
    id: "repair", name:'Repair'
  },
  {
    id: "gold_receipt", name:'Gold Receipt'
  }
  ];
  cols: any[] = [];
  filterForm!: FormGroup;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;

  constructor(
    private _accService: AccService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _confirmPopUp: ConfirmationPopUpService
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: "id", header: "Refrence Number" },
      { field: "created_at", header: "Date" },
      { field: "payment_method_name", header: "Payment Method" },
      { field: "order_status", header: "Payment Status" },
      { field: "amount", header: "SubTotal" },
      { field: "orderproduct_count", header: "Product Count" },
      { field: "salesman_name", header: "Salesman" },
      { field: "total_items", header: "Total Items" },
      { field: "total_weight", header: "Total Weight" },
      { field: "transaction_type", header: "Transaction Type" },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
      transaction_type:''
    });
    this.getTransactions();
  }

  // Get transactions with filtering and pagination
  getTransactions(search: any = '', page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
    const params = `search=${this.filterForm?.value?.search}&transaction_type=${this.filterForm?.value?.transaction_type}`
    // Correct pagination parameters and make API call
    this._accService.getTransactions(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
      this.transactions = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
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
      });
  }
  selectedTransaction: any;

  transactionsMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editTransaction(this.selectedTransaction)
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
      if (res) {
        this.getTransactions()
      }
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
}
