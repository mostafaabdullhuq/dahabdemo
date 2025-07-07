import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { AccService } from '../../@services/acc.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-edit-purchase',
  imports: [SharedModule, RouterLink],
  templateUrl: './add-edit-purchase.component.html',
  styleUrl: './add-edit-purchase.component.scss'
})
export class AddEditPurchaseComponent implements OnInit {
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
  paymentMethods: any = [];
  taxRates: any = [];
  status: any = [
    { id: 'pending', name: 'pending' },
    { id: 'completed', name: 'completed' },
    { id: 'cancelled', name: 'canceled' }
  ]
  manualGoldPrice: any = 0

  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];
  selectedPurityValue: number = 1;

  constructor(
    private _accService: AccService,
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
    private _activeRoute: ActivatedRoute
  ) { }
  decimalInputs = 3;
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
    this._dropdownService.getBranchCountries().subscribe(data => {
      this.countries = data?.results;
    });
    this._dropdownService.getCategories().subscribe(data => {
      this.categories = data?.results;
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
    this._dropdownService.getTaxes().subscribe(data => {
      this.taxRates = data?.results;
    });
    this.addEditExpenseForm.get('branch')?.valueChanges.subscribe(branchId => {
      if (!branchId) return;

      forkJoin({
        goldPrice: this._accService.getGoldPrice(branchId),
        taxRate: this._accService.getBranchTax(branchId)
      }).subscribe(({ goldPrice, taxRate }) => {
        this.manualGoldPrice = goldPrice?.manual_gold_price
        this.addEditExpenseForm.patchValue({
          // manual_gold_price: goldPrice,
          tax: taxRate?.tax_rate
        });

        this.updateMetalRate(); // uses gold price & purity
        this.calculateMetalValue();
        this.calculateTax();
        this.calculateGrossWeight();
        this.calculateLineTotal();
      });

      this._accService.getBranchPaymentMethods(branchId).subscribe(res => {
        this.paymentMethods = res
      })
    });
    this.addEditExpenseForm.get('purity')?.valueChanges.subscribe(purityId => {
      const selectedPurity = this.purities.find(p => p.id === purityId);
      this.selectedPurityValue = (selectedPurity?.purity_value || 1).toFixed(this.decimalInputs);
      this.addEditExpenseForm.get('purity_rate')?.patchValue(selectedPurity?.purity_value)

      this.updateMetalRate();
      this.calculateMetalValue();
      this.calculateTax();
      this.calculateLineTotal();
    });

    this.addEditExpenseForm.get('metal_weight')?.valueChanges.subscribe(() => {
      this.calculateMetalValue();
      this.calculateGrossWeight();
      this.calculateTax();
      this.calculateLineTotal();
    });

    this.addEditExpenseForm.get('making_charge')?.valueChanges.subscribe(() => {
      this.calculateLineTotal();
      this.calculateTax();
    });
    const stones = this.addEditExpenseForm.get('stones') as FormArray;
    stones.valueChanges.subscribe(() => {
      this.calculateTax();
      this.watchStoneControls(); // Keep updating as stones are added
    });
  }

  updateMetalRate() {
    const goldPrice = this.manualGoldPrice || 0;
    const purity = this.selectedPurityValue || 1;
    const rate = (+goldPrice * +purity).toFixed(this.decimalInputs);
    this.addEditExpenseForm.patchValue({ metal_rate: rate });
  }

  calculateMetalValue() {
    const rate = this.addEditExpenseForm.get('metal_rate')?.value || 0;
    const weight = this.addEditExpenseForm.get('metal_weight')?.value || 0;
    this.addEditExpenseForm.patchValue({ metal_value: (+rate * +weight).toFixed(this.decimalInputs) });
    this.calculateTax()
  }

  calculateTax(): void {
    const metalValue = Number(this.addEditExpenseForm.get('metal_value')?.value) || 0;
    const taxRate = Number(this.addEditExpenseForm.get('tax')?.value) || 0;
    const makingCharge = Number(this.addEditExpenseForm.get('making_charge')?.value) || 0;
    const metalWeight = Number(this.addEditExpenseForm.get('metal_weight')?.value) || 0;

    const stones = this.addEditExpenseForm.get('stones') as FormArray;
    const stonesValueTotal = stones.controls.reduce((total, stone) => {
      const value = Number(stone.get('value')?.value) || 0;
      return total + value;
    }, 0);

    const subtotal = metalValue + (makingCharge * metalWeight) + stonesValueTotal;
    const taxAmount = subtotal * (taxRate / 100);

    this.addEditExpenseForm.patchValue({
      tax_amount: +taxAmount.toFixed(this.decimalInputs)
    });
  }

  private subscribedStones = new WeakSet<AbstractControl>();

  private watchStoneControls() {
    const stones = this.addEditExpenseForm.get('stones') as FormArray;

    stones.controls.forEach((control: AbstractControl) => {
      if (this.subscribedStones.has(control)) return; // Avoid duplicates

      this.subscribedStones.add(control);

      control.get('weight')?.valueChanges.subscribe(() => {
        this.calculateGrossWeight();
        this.calculateLineTotal();
      });

      control.get('retail_value')?.valueChanges.subscribe(() => {
        this.calculateTax();
        this.calculateLineTotal();
      });
    });
  }

  calculateGrossWeight() {
    const metalWeight = +this.addEditExpenseForm.get('metal_weight')?.value || 0;
    const stones = this.addEditExpenseForm.get('stones') as FormArray;
    const stoneWeight = stones.controls.reduce((acc, s) => acc + (+s.get('weight')?.value || 0), 0);
    this.addEditExpenseForm.patchValue({ gross_weight: (metalWeight + +stoneWeight).toFixed(this.decimalInputs) });
  }

  calculateLineTotal() {
    const metalValue = Number(this.addEditExpenseForm.get('metal_value')?.value) || 0;
    const metalWeight = Number(this.addEditExpenseForm.get('metal_weight')?.value) || 0;
    const makingCharge = Number(this.addEditExpenseForm.get('making_charge')?.value) || 0;
    const taxAmount = Number(this.addEditExpenseForm.get('tax_amount')?.value) || 0;

    const total = metalValue + (makingCharge * metalWeight) + taxAmount;

    this.addEditExpenseForm.patchValue({
      line_total_amount: (+total).toFixed(this.decimalInputs)
    });
  }
  // calculateMetalValue(): void {
  //   const metalRate = +this.addEditExpenseForm.get('metal_rate')?.value || 0;
  //   const metalWeight = +this.addEditExpenseForm.get('metal_weight')?.value || 0;

  //   const metalValue = metalRate * metalWeight;
  //   this.addEditExpenseForm.get('metal_value')?.setValue(metalValue, { emitEvent: false });

  //   this.calculateLineTotal(); // Trigger next calculation
  // }
  // calculateLineTotal(): void {
  //   const metalValue = +this.addEditExpenseForm.get('metal_value')?.value || 0;
  //   const makingCharge = +this.addEditExpenseForm.get('making_charge')?.value || 0;
  //   const metalWeight = +this.addEditExpenseForm.get('metal_weight')?.value || 0;
  //   const taxAmount = +this.addEditExpenseForm.get('tax_amount')?.value || 0;

  //   const stones = this.stonesArray?.value || [];
  //   const stonesTotal = stones.reduce((sum: number, stone: any) => sum + (+stone.value || 0), 0);

  //   const lineTotal = metalValue + (makingCharge * metalWeight) + taxAmount + stonesTotal;

  //   this.addEditExpenseForm.get('line_total_amount')?.setValue(lineTotal, { emitEvent: false });
  // }

  private initForm(): void {
    this.addEditExpenseForm = this._formBuilder.group({
      supplier: [null, Validators.required],
      branch: [null],
      payment_type: [null],
      expected_delivery_date: [null],
      attachment: [null],

      // Purchase entry form
      tag_number: [null],
      name: [null],
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
      status: [null],
      size: [null],
      designer: [null],
      country: [null],
      description: [null],
      image: [null],
      manual_gold_price: [0],

      /// Stones array
      stones: this._formBuilder.array([this.createStone()]),

      // Payments array
      payments: this._formBuilder.array([this.createPayment()]),

      // Payment summary
      payment_date: ['']
    });
    //this.setupDynamicCalculations();
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
    this.watchStoneControls(); // Watch the new one
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
  addPurchaseRow(): void {
    const formValue = this.addEditExpenseForm.value;
    const item = {
      id: this.editingIndex !== null ? this.purchases[this.editingIndex].id : null,
      tag_number: formValue.tag_number,
      metal_rate: formValue.metal_rate,
      metal_value: formValue.metal_value,
      metal_weight: formValue.metal_weight,
      purity: formValue.purity,
      purity_rate: formValue.purity_rate,
      category: formValue.category,
      making_charge: formValue.making_charge,
      retail_making_charge: formValue.retail_making_charge,
      tax: formValue.tax,
      tax_amount: formValue.tax_amount,
      gross_weight: formValue.gross_weight,
      line_total_amount: formValue.line_total_amount,
      color: formValue.color,
      size: formValue.size,
      name: formValue.name,
      designer: formValue.designer,
      country: formValue.country,
      description: formValue.description,
      image: formValue.attachment,
    };

    if (this.editingIndex !== null) {
      // Update existing item
      this.purchases[this.editingIndex] = item;
      this.editingIndex = null;
    } else {
      // Add new item
      this.purchases.push(item);
    }

    // Reset form
    this.addEditExpenseForm.patchValue({
      tag_number: '',
      name: '',
      metal_rate: 0,
      metal_value: 0,
      metal_weight: 0,
      purity: '',
      purity_rate: 0,
      category: '',
      making_charge: 0,
      retail_making_charge: 0,
      tax: 0,
      tax_amount: 0,
      gross_weight: 0,
      line_total_amount: 0,
      color: '',
      size: '',
      designer: '',
      country: '',
      description: '',
    });
  }

  private loadExpenseData(expenseId: number | string): void {
    this._accService.getPurchaseById(expenseId).subscribe((expense: any) => {
      // Patch basic form values
      this.addEditExpenseForm.patchValue({
        supplier: expense.supplier,
        branch: expense.branch,
        payment_type: expense.type,
        expected_delivery_date: new Date(expense.expected_delivery_date),
        //attachment: expense.attachment,
        status: expense.status,
        total_amount: expense.total_amount,
        tax_amount: expense.tax_amount,
        total_weight: expense.total_weight
      });

      // Clear existing items and add new ones
      this.purchases = [];
      if (expense.items && expense.items.length > 0) {
        const firstItem = expense.items[0];
        this.addEditExpenseForm.patchValue({
          tag_number: firstItem.product?.tag_number,
          name: firstItem.product?.name,
          metal_rate: firstItem.metal_rate,
          metal_value: firstItem.metal_value,
          metal_weight: firstItem.product?.weight,
          purity: firstItem.product?.purity,
          category: firstItem.product?.category,
          making_charge: firstItem.product?.making_charge,
          retail_making_charge: firstItem.product?.retail_making_charge,
          tax: expense.tax_amount,
          tax_amount: firstItem.tax_amount,
          gross_weight: firstItem.product?.weight, // or calculate from metal + stones
          line_total_amount: firstItem.line_total_amount,
          color: firstItem.product?.color,
          size: firstItem.product?.size,
          designer: firstItem.product?.designer,
          country: firstItem.product?.country,
          description: firstItem.product?.description
        });

        // Add all items to purchases table
        this.purchases = expense.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          tag_number: item.product?.tag_number,
          metal_rate: item.metal_rate,
          metal_value: item.metal_value,
          metal_weight: item.product?.weight,
          purity: item.product?.purity,
          category: item.product?.category_name,
          making_charge: item.product?.making_charge,
          retail_making_charge: item.product?.retail_making_charge,
          tax: expense.tax_amount,
          tax_amount: item.tax_amount,
          gross_weight: item.product?.weight,
          line_total_amount: item.line_total_amount,
          color: item.product?.color_name,
          size: item.product?.size_name,
          designer: item.product?.designer_name,
          country: item.product?.country,
          description: item.product?.description,
          is_returned: item.is_returned,
          product_id: item.product?.id
        }));
      }

      // Handle payments
      this.paymentsArray.clear();
      if (expense.payments && expense.payments.length > 0) {
        expense.payments.forEach((payment: any) => {
          const paymentGroup = this.createPayment();
          paymentGroup.patchValue({
            amount: payment.amount,
            payment_method: payment.payment_method
          });
          this.paymentsArray.push(paymentGroup);
        });
      }
    });
  }
  editingIndex: number | null = null;

  editPurchaseRow(item: any, index: number): void {
    // Store the index of the item being edited
    this.editingIndex = index;

    // Patch the form values with the selected item
    this.addEditExpenseForm.patchValue({
      tag_number: item.tag_number,
      metal_rate: item.metal_rate,
      metal_value: item.metal_value,
      metal_weight: item.metal_weight,
      purity: item.purity,
      category: item.category,
      making_charge: item.making_charge,
      name: item.name,
      retail_making_charge: item.retail_making_charge,
      tax: item.tax,
      tax_amount: item.tax_amount,
      gross_weight: item.gross_weight,
      line_total_amount: item.line_total_amount,
      color: item.color,
      size: item.size,
      designer: item.designer,
      country: item.country,
      description: item.description
    });
  }
  //   onBranchChange() {
  //     this.addEditExpenseForm.get('branch')?.valueChanges.subscribe(branchId => {
  //       if (!branchId) return;
  // this._accService.getBranchPaymentMethods(branchId).subscribe(res=>{
  //   this.paymentMethods = res
  // })
  // this._accService.getBranchTax(branchId).subscribe((res:any)=>{
  //           this.addEditExpenseForm.get('tax')?.patchValue(res?.tax_rate);
  // })
  //       this._accService.getGoldPrice(branchId).subscribe(res => {
  //   this.manualGoldPrice = +(+res?.manual_gold_price || 0).toFixed(this.decimalPlaces);
  //         this.addEditExpenseForm.get('metal_rate')?.patchValue(this.manualGoldPrice);

  //         // Only now trigger metal calc
  //         this.handleMetalValueCalc();

  //         this._accService.getBranchTax(branchId)?.subscribe((res: any) => {
  //           this.addEditExpenseForm.get('tax')?.patchValue(res?.tax_rate || 0);
  //         });
  //       });
  //     });
  // }
  // handleMetalValueCalc() {
  //   const purityControl = this.addEditExpenseForm.get('purity');
  //   const weightControl = this.addEditExpenseForm.get('metal_weight');

  //   if (!purityControl || !weightControl) return;

  //   combineLatest([
  //     purityControl.valueChanges.pipe(startWith(purityControl.value)),
  //     weightControl.valueChanges.pipe(startWith(weightControl.value))
  //   ]).subscribe(([purityId, weight]) => {
  //     const purityObject = this.purities.find(p => p.id === purityId);
  //     const purityValue = +purityObject?.purity_value || 0;
  //     const purityNumber = +purityObject?.name || 0;

  //     // Patch purity_rate
  //     this.addEditExpenseForm.get('purity_rate')?.patchValue(purityValue);

  //     // Use calcGoldPrice to calculate gold price
  //     const goldPrice = this.calcGoldPrice({ purity: purityNumber, purity_value: purityValue });
  // console.log(goldPrice);

  //     // Calculate metal_rate using formula: metal_rate = goldPrice * purity_value
  //     const metalRate = +(goldPrice * purityValue).toFixed(this.decimalPlaces);
  //     this.addEditExpenseForm.get('metal_rate')?.patchValue(metalRate);

  //     // Calculate metal_value = metal_rate * metal_weight
  //     const metalWeight = +weight || 0;
  //     const metalValue = +(metalRate * metalWeight).toFixed(this.decimalPlaces);
  //     this.addEditExpenseForm.get('metal_value')?.patchValue(metalValue);

  //     // Recalculate dependent totals
  //     this.calculateValues();
  //   });
  // }
  // private setupDynamicCalculations(): void {
  //   const form = this.addEditExpenseForm;

  //   form.get('metal_rate')?.valueChanges.subscribe(() => this.calculateValues());
  //   form.get('metal_weight')?.valueChanges.subscribe(() => this.calculateValues());
  //   form.get('making_charge')?.valueChanges.subscribe(() => this.calculateValues());
  //   form.get('tax')?.valueChanges.subscribe(() => this.calculateValues());

  //   // If your app allows adding/removing stones dynamically, trigger this after stone changes too
  //   form.get('stones')?.valueChanges.subscribe(() => this.calculateValues());
  // }

  // private calculateValues(): void {
  //   const form = this.addEditExpenseForm;
  //   const metalRate = +form.get('metal_rate')?.value || 0;
  //   const metalWeight = +form.get('metal_weight')?.value || 0;
  //   const makingCharge = +form.get('making_charge')?.value || 0;
  //   const tax = +form.get('tax')?.value || 0;

  //   const metalValue = metalRate * metalWeight;
  //   form.get('metal_value')?.setValue(metalValue, { emitEvent: false });

  //   // Calculate total stone value and total stone weight
  //   const stones = form.get('stones')?.value || [];
  //   let totalStoneValue = 0;
  //   let totalStoneWeight = 0;

  //   stones.forEach((stone: any) => {
  //     totalStoneValue += +stone.value || 0;
  //     totalStoneWeight += +stone.weight || 0;
  //   });

  //   // ✅ Calculate and patch gross weight (metal + stones)
  //   const grossWeight = metalWeight + totalStoneWeight;
  //   form.get('gross_weight')?.setValue(grossWeight, { emitEvent: false });

  //   const taxAmount = (metalValue + totalStoneValue) * tax;
  //   form.get('tax_amount')?.setValue(taxAmount, { emitEvent: false });

  //   const lineTotal = metalValue + (makingCharge * metalWeight) + taxAmount + totalStoneValue;
  //   form.get('line_total_amount')?.setValue(lineTotal, { emitEvent: false });
  // }
  // decimalPlaces:number = 3;
  // calcGoldPrice(group: { purity: number; purity_value: number }): number {
  //   if (!this.manualGoldPrice || !group.purity || !group.purity_value) return 0;

  //   const baseValue = (+this.manualGoldPrice / 31.10348) * 0.378;

  //   let purityFactor = 1;
  //   switch (group.purity) {
  //     case 24: purityFactor = 1; break;
  //     case 22: purityFactor = 0.916; break;
  //     case 21: purityFactor = 0.88; break;
  //     case 18: purityFactor = 0.75; break;
  //     default: purityFactor = 1;
  //   }

  //   const goldPrice = baseValue * purityFactor //* group.purity_value;

  //   return +goldPrice.toFixed(this.decimalPlaces);
  // }

  getTotalLineAmount(): number {
    return this.purchases.reduce((total, item) => {
      return total + (Number(item.line_total_amount) || 0);
    }, 0);
  }

  getTotalGrossWeight(): number {
    return this.purchases.reduce((total, item) => {
      return total + (Number(item.gross_weight) || 0);
    }, 0);
  }

  toFormData(payload: any): FormData {
    const formData = new FormData();

    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        // Skip appending 'attachment' if it's null, undefined, or empty string
        if (key === 'attachment') {
          if (payload[key]) {
            formData.append(key, payload[key]); // only if truthy (i.e., a File)
          }
        } else {
          formData.append(key, payload[key]);
        }
      }
    }

    return formData;
  }

  onSubmit(): void {
    if (this.addEditExpenseForm.invalid) {
      this.addEditExpenseForm.markAllAsTouched();
      return;
    }

    const formValue = this.addEditExpenseForm.value;

    const formattedDate = new Date(formValue.expected_delivery_date).toISOString().slice(0, 10);
    const formattedPaymentDate = new Date(formValue.payment_date).toISOString().slice(0, 10);
    const items = this.purchases.map(item => ({
      quantity: 1,
      line_total_amount: item.line_total_amount,
      product: {
        name: item.name,
        making_charge: item.making_charge,
        retail_making_charge: item.retail_making_charge,
        weight: item.metal_weight,
        branch: formValue.branch,
        country: item.country,
        purity: item.purity,
        metal_rate: item.metal_rate,
        metal_value: item.metal_value,
        tax_amount: item.tax_amount,
        // purity_name: item.purity,
        gross_weight: item.gross_weight,
        category: item.category,
        size: item.size,
        designer: item.designer,
        color: item.color,
        is_active: true,
        stones: this.stonesArray.value.map((stone: any) => ({
          stone_id: stone.stone,
          stone_name: stone.stone,
          value: stone.value,
          weight: stone.weight,
          retail_value: stone.retail_value
        }))
      }
    }));
    const payments = {
      items: formValue.payments,
      payment_date: formattedPaymentDate
    };
    const totalAmount = this.purchases.reduce((sum, item) => sum + Number(item.line_total_amount || 0), 0);
    const totalWeight = this.purchases.reduce((sum, item) => sum + Number(item.gross_weight || 0), 0);
    const payload: any = {
      supplier_name: formValue.supplier,
      expected_delivery_date: formattedDate,
      branch_name: formValue.branch,
      branch: formValue.branch,
      supplier: formValue.supplier,
      tax_amount: formValue.tax_amount,
      total_amount: totalAmount,
      total_weight: totalWeight,
      type: formValue.payment_type,
      attachment: formValue.attachment, // file
      items: JSON.stringify(items),
      payments: JSON.stringify(payments)
    };

    const formDataPayload = this.toFormData(payload);

    const request$ = this.productId && this.isEditMode
      ? this._accService.updatePurchase(this.productId, formDataPayload)
      : this._accService.addPurchase(formDataPayload);

    request$.subscribe({
      next: () => { } //this.addEditExpenseForm.reset(),
      , error: (err) => console.error(err)
    });
  }
}
