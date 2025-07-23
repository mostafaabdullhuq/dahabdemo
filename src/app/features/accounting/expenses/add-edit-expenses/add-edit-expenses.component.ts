import { ChangeDetectorRef, Component } from '@angular/core';
import { AccService } from '../../@services/acc.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-edit-expenses',
  imports: [SharedModule],
  templateUrl: './add-edit-expenses.component.html',
  styleUrl: './add-edit-expenses.component.scss'
})
export class AddEditExpensesComponent {
  addEditExpenseForm!: FormGroup;
  isEditMode = false;
  productId: string | number = '';
  subCategories: any[] = [];
  expensesCat: any[] = [];
  branches: any[] = [];
  paymentMethods: any[] = [];
  minimalBranchTransactions: any[] = []
  minimalBranchPurchases: any[] = []
  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];
  taxes: any[] = [];
  users: any[] = [];
  suppliers: any[] = [];
  customers: any[] = [];


  constructor(
    private _accService: AccService,
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
    private _activeRoute: ActivatedRoute,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    const productId = this._activeRoute.snapshot.paramMap.get('id');
    if (productId) this.productId = productId;

    this.initForm();

    if (this.productId) {
      this.loadExpenseData(this.productId);
      this.isEditMode = true
    }

    this.getLookupData();
  }

  private getLookupData() {
    this._accService.getExpenseCategories().subscribe(data => {
      this.expensesCat = data;
    });

    this._accService.getExpenseSubCategories().subscribe(data => {
      this.subCategories = data;
    });

    this._dropdownService.getBranches().subscribe(data => {
      this.branches = data?.results;
    });

    this._dropdownService.getTaxes().subscribe((res) => {
      this.taxes = res?.results || [];
    });


    this._dropdownService.getUsers(null, true).subscribe(result => {
      this.users = result?.results;
    })


    this._dropdownService.getSuppliers(null, true).subscribe(result => {
      this.suppliers = result?.results;
    })


    this._dropdownService.getCustomersSearch(null, true).subscribe(result => {
      this.customers = result?.results;
    })
  }

  onCustomerChange(customerId: number) {
    if (customerId) {
      // Clear other contact selections and purchase order
      this.addEditExpenseForm.patchValue({
        supplier: null,
        user: null,
        purchase_order: null
      });
    } else {
      // Clear invoice when no customer selected
      this.addEditExpenseForm.patchValue({
        invoice: null
      });
    }
  }

  onInvoiceChange(invoiceId: number) {
    // Auto-clear invoice if no customer is selected (optional - provides better UX)
    if (invoiceId && !this.addEditExpenseForm.get('customer')?.value) {
      // Clear the invalid selection immediately
      this.addEditExpenseForm.patchValue({
        invoice: null
      });
    }
  }

  onPurchaseChange(purchaseId: number) {
    // Auto-clear purchase if no supplier is selected (optional - provides better UX)
    if (purchaseId && !this.addEditExpenseForm.get('supplier')?.value) {
      // Clear the invalid selection immediately
      this.addEditExpenseForm.patchValue({
        purchase_order: null
      });
    }
  }

  onUserChange(userid: number) {
    if (userid) {
      // Clear other contact selections and both invoice and purchase
      this.addEditExpenseForm.patchValue({
        customer: null,
        supplier: null,
        invoice: null,
        purchase_order: null
      });
    }
  }

  onSupplierChange(supplierId: number) {
    if (supplierId) {
      // Clear other contact selections and invoice
      this.addEditExpenseForm.patchValue({
        customer: null,
        user: null,
        invoice: null
      });
    } else {
      // Clear purchase order when no supplier selected
      this.addEditExpenseForm.patchValue({
        purchase_order: null
      });
    }
  }

  private initForm(): void {
    this.addEditExpenseForm = this._formBuilder.group({
      notes: [null],
      user: [null],
      customer: [null],
      category: [null],
      branch: [null],
      supplier: [null],
      attachment: [null],
      applicable_tax: [null],
      date: [new Date(), Validators.required],
      invoice: [null],
      purchase_order: [null],
      reference_number: [null],
      is_recurring: [false],
      recurring_interval: [null],
      recurring_interval_type: ['days'],
      total_amount: [null, Validators.required],
      number_of_recurring_payments: [null],
      sub_category: [null],
      payment: this._formBuilder.group({
        payment_method: [null, Validators.required],
        amount: [null, Validators.required],
        note: [null],
        paid_on: [new Date()],
      })
    });
  }

  onBranchChange(branchId: number) {
    if (!branchId) return;

    this._accService.getBranchPaymentMethods(branchId).subscribe((result) => {
      this.paymentMethods = result;
    });

    this._accService.getMinimalBranchTransactions(branchId).subscribe((result) => {
      this.minimalBranchTransactions = result?.results ?? [];
      this.minimalBranchTransactions = this.minimalBranchTransactions.filter(transaction => transaction.invoice_id !== null);
    });

    this._accService.getMinimalBranchPurchases(branchId).subscribe((result) => {
      this.minimalBranchPurchases = result?.results ?? [];
    });
  }

  private loadExpenseData(expenseId: number | string): void {
    this._accService.getExpenseById(expenseId).subscribe((expense: any) => {

      this.addEditExpenseForm.patchValue({
        total_amount: expense.total_amount,
        date: expense.date,
        attachment: expense.attachment,
        reference_number: expense.reference_number,
        notes: expense.notes,
        is_recurring: expense.is_recurring,
        recurring_interval: expense.recurring_interval,
        recurring_interval_type: expense.recurring_interval_type,
        number_of_recurring_payments: expense.number_of_recurring_payments,
        branch: expense.branch,
        invoice: expense.invoice,
        purchase_order: expense.purchase_order,
        user: expense.user,
        customer: expense.customer,
        supplier: expense.supplier,
        applicable_tax: expense.applicable_tax,
        category: expense.category,
        sub_category: expense.sub_category,
        payment: {
          amount: expense.payment?.amount.toFixed(3),
          note: expense.payment?.note,
          paid_on: expense.payment?.paid_on,
          payment_account: expense.payment?.payment_account,
          attachment: expense.payment?.attachment,
          payment_method: expense.payment?.payment_method,
        }
      });
    });
  }

  customFields = [
    { name: 'custom_field_1', label: 'Custom Field 1' },
    { name: 'custom_field_2', label: 'Custom Field 2' },
    { name: 'custom_field_3', label: 'Custom Field 3' }
  ];


  onSubmit(): void {
    if (this.addEditExpenseForm.invalid) return;

    let paymentControl = this.addEditExpenseForm.get("payment");

    let amountValue = paymentControl?.get("amount")?.value ?? 0;

    paymentControl?.patchValue({
      amount: (+amountValue).toFixed(3) ?? 0
    })

    const formValue = this.addEditExpenseForm.value;
    if (formValue.sub_category) {
      const subCategory = formValue.sub_category;
      delete formValue.sub_category;
      formValue.category = subCategory;
    }

    if (formValue.date) {
      formValue.date = formValue.date.toISOString()
    }

    const formData = new FormData();

    for (const key in formValue) {
      if (formValue.hasOwnProperty(key) && formValue[key] !== null && formValue[key] !== undefined) {
        if (key !== "attachment" && Array.isArray(formValue[key]) || typeof formValue[key] === 'object') {
          formData.append(key, JSON.stringify(formValue[key]));
        } else {
          formData.append(key, formValue[key]);
        }
      }
    }

    // Send formData to server
    const request$ = this.isEditMode && this.productId
      ? this._accService.updateExpense(this.productId, formData)
      : this._accService.addExpense(formData);

    request$.subscribe({
      next: res => {
        this._router.navigate(['acc/expenses'])
      },
      error: err => {
        console.error('Submission error:', err);
      }
    });
  }
}
