import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { AccService } from '../../@services/acc.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { combineLatest, startWith } from 'rxjs';

@Component({
  selector: 'app-add-edit-purchase',
  imports: [SharedModule],
  templateUrl: './add-edit-purchase.component.html',
  styleUrl: './add-edit-purchase.component.scss'
})
export class AddEditPurchaseComponent {
  addEditExpenseForm!: FormGroup;
  isEditMode = false;
  productId: string | number = '';
  stockPoints: any[] = [];
  units: any[] = [];
  designers: any[] = [];
  sizes: any[] = [];
  suppliers: any[] = [];
  purities: any[] = [];
  categories: any[] = [];
  brands: any[] = [];
  expensesCat: any[] = [];
  branches: any[] = [];
  stones: any[] = [];
  colors: any[] = [];
  countries: any[] = [];
purchases: any[] = [];
payments: any[] = [];
paymentMethods:any = [];

manualGoldPrice:any = 0

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
     this._dropdownService.getSuppliers().subscribe(data => {
      this.suppliers = data?.results;
    });
    this._dropdownService.getColor().subscribe(data => {
      this.colors = data?.results;
    });
    this._dropdownService.getCountries().subscribe(data => {
      this.countries = data?.results;
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
    this.onBranchChange();
  }

  private initForm(): void {
   this.addEditExpenseForm = this._formBuilder.group({
      supplier: [null, Validators.required],
      branch: [null],
      payment_type: [null],
      date: [null],
      attachment: [null],

      // Purchase entry form
      tag_number: [null],
      metal_rate: [null],
      metal_value: [null],
      metal_weight: [null],
      purity: [null],
      purity_rate: [null],
      category: [null],
      making_charge: [null],
      retail_making_charge: [null],
      tax: [null],
      tax_amount: [null],
      gross_weight: [null],
      line_total_amount: [null],
      color: [null],
      size: [null],
      designer: [null],
      country: [null],
      description: [null],
      image: [null],

      /// Stones array
    stones: this._formBuilder.array([this.createStone()]),

    // Payments array
    payments: this._formBuilder.array([this.createPayment()]),

      // Payment summary
      payment_date: ['']
    });
  }
  createStone(): FormGroup {
  return this._formBuilder.group({
    stone: [null],
    weight: [''],
    value: [''],
    retail_value: ['']
  });
}

createPayment(): FormGroup {
  return this._formBuilder.group({
    amount: [''],
    payment_method: [null]
  });
}

get stonesArray(): FormArray {
  return this.addEditExpenseForm.get('stones') as FormArray;
}

get paymentsArray(): FormArray {
  return this.addEditExpenseForm.get('payments') as FormArray;
}

addStone() {
  this.stonesArray.push(this.createStone());
}

addPayment() {
  this.paymentsArray.push(this.createPayment());
}

removeStone(index: number) {
  this.stonesArray.removeAt(index);
}

removePayment(index: number) {
  this.paymentsArray.removeAt(index);
}
addPurchaseRow() {
    const purchase = {
      tag_number: this.addEditExpenseForm.value.tag_number,
      metal_rate: this.addEditExpenseForm.value.metal_rate,
      metal_value: this.addEditExpenseForm.value.metal_value,
      metal_weight: this.addEditExpenseForm.value.metal_weight,
      purity: this.addEditExpenseForm.value.purity,
      purity_rate: this.addEditExpenseForm.value.purity_rate,
      category: this.addEditExpenseForm.value.category,
      making_charge: this.addEditExpenseForm.value.making_charge,
      retail_making_charge: this.addEditExpenseForm.value.retail_making_charge,
      tax: this.addEditExpenseForm.value.tax,
      tax_amount: this.addEditExpenseForm.value.tax_amount,
      gross_weight: this.addEditExpenseForm.value.gross_weight,
      line_total_amount: this.addEditExpenseForm.value.line_total_amount,
      color: this.addEditExpenseForm.value.color,
      size: this.addEditExpenseForm.value.size,
      designer: this.addEditExpenseForm.value.designer,
      country: this.addEditExpenseForm.value.country,
      description: this.addEditExpenseForm.value.description,
      image: this.addEditExpenseForm.value.attachment // You might separate image if needed
    };
    this.purchases.push(purchase);
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
 
onBranchChange() {
  this.addEditExpenseForm.get('branch')?.valueChanges.subscribe(branchId => {
    if (!branchId) return;

    this._accService.getGoldPrice(branchId).subscribe(res => {
      this.manualGoldPrice = +(+res?.manual_gold_price || 0).toFixed(this.decimalPlaces);
      this.addEditExpenseForm.get('metal_rate')?.patchValue(this.manualGoldPrice);
      
      // Trigger metal value calc after price is fetched
      this.handleMetalValueCalc();
    });
  });
}
handleMetalValueCalc() {
  const purityControl = this.addEditExpenseForm.get('purity');
  const weightControl = this.addEditExpenseForm.get('metal_weight');

  if (!purityControl || !weightControl) return;

  // Combine both valueChanges
  combineLatest([
    purityControl.valueChanges.pipe(startWith(purityControl.value)),
    weightControl.valueChanges.pipe(startWith(weightControl.value))
  ]).subscribe(([purityId, weight]) => {
    const purityObject = this.purities.find(p => p.id === purityId);
    const purity_value = purityObject?.purity_value || 0;
    const karat = purityObject?.purity_value;
   this.addEditExpenseForm.get('purity_rate')?.patchValue(purityObject?.purity_value)

    const goldRate = this.calcGoldPrice({
      purity: +karat,
      purity_value
    });

    const metalValue = +(goldRate * (+weight || 0)).toFixed(this.decimalPlaces);

    this.addEditExpenseForm.patchValue({
      metal_value: metalValue
    });
  });
}
decimalPlaces:number = 3;
calcGoldPrice(group: { purity: number; purity_value: number }): number {
  if (!this.manualGoldPrice || !group.purity || !group.purity_value) return 0;

  const baseValue = (+this.manualGoldPrice / 31.10348) * 0.378;

  let purityFactor = 1;
  switch (group.purity) {
    case 24: purityFactor = 1; break;
    case 22: purityFactor = 0.916; break;
    case 21: purityFactor = 0.88; break;
    case 18: purityFactor = 0.75; break;
    default: purityFactor = 1;
  }

  const goldPrice = baseValue * purityFactor * group.purity_value;
  return +goldPrice.toFixed(this.decimalPlaces);
}
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
