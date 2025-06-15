import { Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AccService } from '../../@services/acc.service';
import { Router } from '@angular/router';
import { ConfirmationPopUpService } from '../../../../shared/services/confirmation-pop-up.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../../shared/shared.module';
import { RestoreTransactionsComponent } from './restore-transactions/restore-transactions.component';

@Component({
  selector: 'app-deleted-transactions',
  imports: [SharedModule],
  templateUrl: './deleted-transactions.component.html',
  styleUrl: './deleted-transactions.component.scss'
})
export class DeletedTransactionsComponent implements OnInit {
  expenses: any[] = [];
  suppliers: any[] = [];
  branches: any[] = [];
  status: any[] = [
     {
    id: "", name:'All'
  },
  {
    id: "pending", name:'pending'
  },
  {
    id: "approved", name:'approved'
  },
  {
    id: "shipped", name:'delivered'
  },
  {
    id: "delivered", name:'delivered'
  },
  {
    id: "cancelled", name:'cancelled'
  }
  ];
  type:any[] = [
    {id:'' , name:'All'},
    {id:'fixed' , name:'fixed'},
    {id:'unfixed' , name:'unfixed'},
  ]
  cols: any[] = [];
  filterForm!: FormGroup;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;

  constructor(
    private _accService: AccService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _confirmPopUp: ConfirmationPopUpService,
    private _dropdown:DropdownsService
  ) { }

  ngOnInit(): void {
     this.cols = [
      { field: "reference_number", header: "Refrence Number" },
      {
        field: "created_at", header: "Date",
        body: (row: any) => {
          if (!row?.created_at) return '-';
          const date = new Date(row.created_at);
          const formatted = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          return formatted;
        }
      },
      { field: "payment_method_name", header: "Payment Method" },
      {
        field: "order_status", header: "Payment Status",
        body: (row: any) => {
          const status = row?.order_status;
          let className = '';
          let label = '';

          switch (status) {
            case 'pending':
              className = 'badge rounded-pill text-bg-warning';
              label = 'Pending';
              break;
            case 'paid':
              className = 'badge rounded-pill text-bg-success';
              label = 'Paid';
              break;
            case 'partially_paid':
              className = 'badge rounded-pill text-bg-danger';
              label = 'Partially Paid';
              break;
            default:
              className = 'badge text-secondary';
              label = status || 'Unknown';
          }

          return `<span class="${className}">${label}</span>`;
        },
        escape: false // 👈 important to allow HTML rendering in PrimeNG

      },
      { field: "amount", header: "SubTotal" },
      { field: "orderproduct_count", header: "Product Count" },
      { field: "salesman_name", header: "Salesman" },
      { field: "total_items", header: "Total Items" },
      { field: "total_weight", header: "Total Weight" },
      { field: "transaction_type", header: "Transaction Type" },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
      transaction_type:'',
      branch:'',
      payments__payment_method__id:'',
      supplier:'',
      type:'',
      order_date:'',
      status:''
    });
    this.getDeletedTransactions();
    this._dropdown.getBranches().subscribe(res=>{
      this.branches = res?.results
    })
    this._dropdown.getSuppliers().subscribe(res=>{
      this.suppliers = res?.results
    })
  }

  // Get expenses with filtering and pagination
  getDeletedTransactions(search: any = '', page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
    const params = `
    search=${this.filterForm?.value?.search}&
    status=${this.filterForm?.value?.status}&
    branch=${this.filterForm?.value?.branch}&
    type=${this.filterForm?.value?.type}&
    order_date=${this.filterForm?.value?.order_date}&
    `
    // Correct pagination parameters and make API call
    this._accService.getDeletedTransactions(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
      this.expenses = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }
  loadPurchases(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;

    this._accService.getDeletedTransactions(this.filterForm?.value?.search || '', page, pageSize)
      .subscribe((res) => {
        this.expenses = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedTransaction: any;

  expensesMenuItems: MenuItem[] = [
    {
      label: 'Restore',
      icon: 'pi  pi-refresh',
      command: () => this.openViewPayment(this.selectedTransaction?.id)
    }
  ];

  deleteExpense(user: any) {
    this._accService.deleteExpense(user?.id).subscribe(res => {
      if (res) {
        this.getDeletedTransactions()
      }
    })
  }
  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteExpense(user);
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

    this.getDeletedTransactions(queryParams, 1, 10);
  }
     componentRef!: ComponentRef<any>;
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  
  openViewPayment(id:any){
        this.container.clear();
    this.componentRef = this.container.createComponent(RestoreTransactionsComponent);
    this.componentRef.instance.showDialog();
    this.componentRef.instance.transId=id;
    this.componentRef.instance.isAddSuccessfully.subscribe(()=>{
        this.getDeletedTransactions()
    })

  }
}