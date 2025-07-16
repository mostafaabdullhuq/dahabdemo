import { Component, ComponentRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AccService } from '../@services/acc.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../shared/shared.module';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { PaymentExpenseComponent } from './payment-expense/payment-expense.component';

@Component({
  selector: 'app-expenses',
  imports: [SharedModule, RouterLink],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {
  expenses: any[] = [];
  suppliers: any[] = [];
  branches: any[] = [];
  status: any[] = [
    {
      id: "", name: 'All'
    },
    {
      id: "pending", name: 'pending'
    },
    {
      id: "approved", name: 'approved'
    },
    {
      id: "shipped", name: 'delivered'
    },
    {
      id: "delivered", name: 'delivered'
    },
    {
      id: "cancelled", name: 'cancelled'
    }
  ];
  type: any[] = [
    { id: '', name: 'All' },
    { id: 'fixed', name: 'fixed' },
    { id: 'unfixed', name: 'unfixed' },
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
    private _dropdown: DropdownsService
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: "id", header: "ID" },
      { field: "name", header: "Expense Name" },
      { field: "reference_number", header: "Refrence Number" },
      { field: "total_amount", header: "Amount" },
      { field: "date", header: "Date" },
      { field: "category", header: "Category" },
      { field: "payment_status", header: "Payment Status" },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
      transaction_type: '',
      branch: '',
      payments__payment_method__id: '',
      supplier: '',
      type: '',
      order_date: '',
      status: ''
    });
    this.getExpenses();
    this._dropdown.getBranches().subscribe(res => {
      this.branches = res?.results
    })
    this._dropdown.getSuppliers().subscribe(res => {
      this.suppliers = res?.results
    })
  }

  // Get expenses with filtering and pagination
  getExpenses(search: any = '', page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
    const params = `
    search=${this.filterForm?.value?.search}&
    status=${this.filterForm?.value?.status}&
    branch=${this.filterForm?.value?.branch}&
    type=${this.filterForm?.value?.type}&
    order_date=${this.filterForm?.value?.order_date}&
    `
    // Correct pagination parameters and make API call
    this._accService.getExpenses(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
      this.expenses = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }

  loadPurchases(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;

    this._accService.getExpenses(this.filterForm?.value?.search || '', page, pageSize)
      .subscribe((res) => {
        this.expenses = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedTransaction: any;

  expensesMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editExpense(this.selectedTransaction)
    },
    {
      label: 'Add Payment',
      icon: 'pi pi-fw pi-payment',
      command: () => this.addPayment(this.selectedTransaction)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedTransaction)
    }

  ];

  editExpense(user: any) {
    this._router.navigate([`acc/expense/edit/${user?.id}`]);
  }

  deleteExpense(user: any) {
    this._accService.deleteExpense(user?.id).subscribe(res => {
      if (res) {
        this.getExpenses()
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

  @ViewChild('paymentContainer', { read: ViewContainerRef }) container!: ViewContainerRef;
  private componentRef!: ComponentRef<PaymentExpenseComponent>;
  addPayment(data: any) {
    this.container.clear();
    this.componentRef = this.container.createComponent(PaymentExpenseComponent);
    this.componentRef.instance.paymentData = data;
    this.componentRef.instance.showDialog();
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

    this.getExpenses(queryParams, 1, 10);
  }
}
