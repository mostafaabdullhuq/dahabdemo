import { Component } from '@angular/core';
import { AccService } from '../../@services/acc.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { ActivatedRoute } from '@angular/router';
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
  stockPoints: any[] = [];
  units: any[] = [];
  designers: any[] = [];
  sizes: any[] = [];
  purities: any[] = [];
  categories: any[] = [];
  brands: any[] = [];
  expensesCat: any[] = [];
  branches: any[] = [];
  stones: any[] = [];

  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];

  constructor(
    private _accService: AccService,
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const productId = this._activeRoute.snapshot.paramMap.get('id');
    console.log(productId);
    if (productId)
      this.productId = productId;
    this.initForm();
    if (this.productId) {
      this.loadExpenseData(this.productId);
      this.isEditMode = true
    }

    this._dropdownService.getBrands().subscribe(data => {
      this.brands = data?.results;
    });
    this._accService.getExpenseCategories().subscribe(data=>{
      this.expensesCat = data?.results;
    })
    this._dropdownService.getPurities().subscribe(data => {
      this.purities = data?.results;
    });
    this._dropdownService.getBranches().subscribe(data => {
      this.branches = data?.results;
    });
    this._dropdownService.getSizes().subscribe(data => {
      this.sizes = data?.results;
    });
    this._dropdownService.getStones().subscribe(data => {
      this.stones = data?.results;
    });
    this._dropdownService.getDesigners().subscribe(data => {
      this.designers = data?.results;
    });
    this._dropdownService.getUnits().subscribe(data => {
      this.units = data?.results;
    });
    this._dropdownService.getStockPoints().subscribe(data => {
      this.stockPoints = data?.results;
    });
  }

  private initForm(): void {
    this.addEditExpenseForm = this._formBuilder.group({
      total_amount: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      attachment: ['', Validators.required],
      reference_number: [''],
      notes: [''],
      is_recurring: [false],
      is_refund: [false],
      expense_as_vat: [false],
      recurring_interval: [null],
      recurring_interval_type: ['days'],
      recurring_start_date: [''],
      recurring_end_date: [''],
      number_of_recurring_payments: [null],
      branch: [0],
      business: [0],
      invoice: [0],
      purchase_order: [0],
      user: [0],
      customer: [0],
      applicable_tax: [0],
      category: [0],
      sub_category: [0],
      payment: this._formBuilder.group({
        amount: ['', Validators.required],
        note: [''],
        paid_date: [''],
        payment_account: [''],
        attachment: ['', Validators.required],
        payment_method: [null, Validators.required],
      })
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
      is_refund: expense.is_refund,
      expense_as_vat: expense.expense_as_vat,
      recurring_interval: expense.recurring_interval,
      recurring_interval_type: expense.recurring_interval_type,
      recurring_start_date: expense.recurring_start_date,
      recurring_end_date: expense.recurring_end_date,
      number_of_recurring_payments: expense.number_of_recurring_payments,
      branch: expense.branch,
      business: expense.business,
      invoice: expense.invoice,
      purchase_order: expense.purchase_order,
      user: expense.user,
      customer: expense.customer,
      applicable_tax: expense.applicable_tax,
      category: expense.category,
      sub_category: expense.sub_category,
      payment: {
        amount: expense.payment?.amount,
        note: expense.payment?.note,
        paid_date: expense.payment?.paid_date,
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

  const formValue = this.addEditExpenseForm.value;
  const formData = new FormData();

  // Append top-level fields (excluding nested 'payment')
  Object.keys(formValue).forEach(key => {
    const value = formValue[key];

    if (key === 'payment') {
      // Handle payment group separately below
      return;
    }

    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  // Append nested payment group
  if (formValue.payment) {
    Object.keys(formValue.payment).forEach(paymentKey => {
      const value = formValue.payment[paymentKey];
      if (value !== null && value !== undefined) {
        formData.append(`payment.${paymentKey}`, value);
      }
    });
  }

  // Send formData to server
  const request$ = this.isEditMode && this.productId
    ? this._accService.updateExpense(this.productId, formData)
    : this._accService.addExpense(formData);

  request$.subscribe({
    next: res => {
      console.log(this.isEditMode ? 'Expense updated' : 'Expense created', res);
      // You may add a redirect or form reset here
    },
    error: err => {
      console.error('Submission error:', err);
    }
  });
}
}
