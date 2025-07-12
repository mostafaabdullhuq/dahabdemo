import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { AccService } from '../../@services/acc.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { forkJoin } from 'rxjs';
import { ToasterMsgService } from '../../../../core/services/toaster-msg.service';

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
    private _activeRoute: ActivatedRoute,
    private _toasterService: ToasterMsgService,
    private _router: Router
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
      // Main purchase fields
      order_date: [new Date()],
      // expected_delivery_date: [null, Validators.required],
      branch: [null, Validators.required],
      supplier: [null, Validators.required],
      total_amount: [0],
      tax_amount: [0],
      total_weight: [0],
      type: ['fixed'],
      status: ['pending'],
      attachment: [null],
      reference_number: [''],

      // Product entry form (for adding to items array)
      product: this._formBuilder.group({
        name: [''],
        making_charge: [0],
        retail_making_charge: [0],
        weight: [0],
        branch_id: [null],
        country: [''],
        is_active: [true],
        max_discount: [0],
        stone_kr: [''],
        description: [''],
        purity: [null],
        category: [null],
        brand: [null],
        unit: [null],
        size: [null],
        designer: [null],
        color: [null],
        stones: this._formBuilder.array([])
      }),

      // Item level fields
      quantity: [1],
      line_total_amount: [0],
      metal_amount: [0],
      stone_amount: [0],
      is_returned: [false],
      metal_value: [0],
      metal_rate: [0],
      tax_amount_item: [0],

      // Form helpers (for UI only)
      tag_number: [null],
      name: [''],
      metal_weight: [null],
      purity_rate: [null],
      tax: [null],
      gross_weight: [null],
      manual_gold_price: [0],
      purity: [null],
      category: [null],
      making_charge: [0],
      retail_making_charge: [0],
      color: [null],
      size: [null],
      designer: [null],
      country: [null],
      description: [''],
      brand: [null],
      unit: [null],

      // Stones array for current product
      stones: this._formBuilder.array([]),

      // Payments array
      payments: this._formBuilder.array([this.createPayment()]),
    });
  }

  createStone(): FormGroup {
    return this._formBuilder.group({
      product: [0],
      stone_id: [null],
      value: [0],
      weight: [0],
      retail_value: [0]
    });
  }

  createPayment(): FormGroup {
    return this._formBuilder.group({
      purchase_order: [0],
      payment_date: [''],
      payment_method: [null],
      salesman: [0],
      branch: [0],
      amount: [0],
      items: this._formBuilder.array([this.createPaymentItem()])
    });
  }

  createPaymentItem(): FormGroup {
    return this._formBuilder.group({
      purchase_payment: [0],
      type: ['TTB'],
      is_fixed: [true],
      amount: [0],
      description: [''],
      product_id: [0],
      quantity: [1],
      pure_weight: [0],
      weight: [0],
      purchase_order: [0]
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

  addPaymentItem(paymentIndex: number) {
    const payment = this.paymentsArray.at(paymentIndex) as FormGroup;
    const itemsArray = payment.get('items') as FormArray;
    itemsArray.push(this.createPaymentItem());
  }

  removePaymentItem(paymentIndex: number, itemIndex: number) {
    const payment = this.paymentsArray.at(paymentIndex) as FormGroup;
    const itemsArray = payment.get('items') as FormArray;
    itemsArray.removeAt(itemIndex);
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
        type: expense.type,
        order_date: expense.order_date ? new Date(expense.order_date) : new Date(),
        // expected_delivery_date: new Date(expense.expected_delivery_date),
        //attachment: expense.attachment,
        status: expense.status,
        total_amount: expense.total_amount,
        tax_amount: expense.tax_amount,
        total_weight: expense.total_weight,
        reference_number: expense.reference_number
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
        } else if (key === 'items' || key === 'payments') {
          // Stringify complex objects
          formData.append(key, JSON.stringify(payload[key]));
        } else {
          formData.append(key, payload[key]);
        }
      }
    }

    return formData;
  }

  // Utility function to remove falsy values from objects
  private cleanObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanObject(item)).filter(item => item !== null && item !== undefined);
    } else if (obj !== null && typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          // Keep boolean false values, but remove other falsy values
          if (value === false || (value !== null && value !== undefined && value !== '' && value !== 0)) {
            cleaned[key] = this.cleanObject(value);
          }
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : null;
    }
    return obj;
  }

  onSubmit(): void {
    if (this.addEditExpenseForm.invalid) {
      this.addEditExpenseForm.markAllAsTouched();
      return;
    }

    const formValue = this.addEditExpenseForm.value;

    // Format dates
    // const formattedDeliveryDate = formValue.expected_delivery_date ?
    //   new Date(formValue.expected_delivery_date).toISOString().slice(0, 10) : '';
    const orderDate = formValue.order_date ?
      new Date(formValue.order_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

    // Get related entity names
    const selectedSupplier = this.suppliers.find(s => s.id === formValue.supplier);
    const selectedBranch = this.branches.find(b => b.id === formValue.branch);

    // Build items array from purchases
    const items = this.purchases.map(item => {
      // Get related entity names for product
      const selectedPurity = this.purities.find(p => p.id === item.purity);
      const selectedCategory = this.categories.find(c => c.id === item.category);
      const selectedBrand = this.brands.find(b => b.id === item.brand);
      const selectedUnit = this.units.find(u => u.id === item.unit);
      const selectedSize = this.sizes.find(s => s.id === item.size);
      const selectedDesigner = this.designers.find(d => d.id === item.designer);
      const selectedColor = this.colors.find(c => c.id === item.color);
      const selectedCountry = this.countries?.find(c => c.id === item.country);

      const productData = {
        name: item.name || "",
        making_charge: item.making_charge?.toString() || "0",
        retail_making_charge: item.retail_making_charge?.toString() || "0",
        weight: item.metal_weight?.toString() || "0",
        branch: selectedBranch?.name || "",
        branch_id: formValue.branch,
        country: selectedCountry?.name || "",
        purity_name: selectedPurity?.name || "",
        category_name: selectedCategory?.name || "",
        brand_name: selectedBrand?.name || "",
        unit_name: selectedUnit?.name || "",
        size_name: selectedSize?.name || "",
        designer_name: selectedDesigner?.name || "",
        color_name: selectedColor?.name || "",
        is_active: true,
        max_discount: 0,
        stones: this.stonesArray.value.map((stone: any) => {
          const selectedStone = this.stones.find(s => s.id === stone.stone_id);
          return this.cleanObject({
            stone_id: stone.stone_id,
            value: stone.value?.toString(),
            weight: stone.weight?.toString(),
            retail_value: stone.retail_value?.toString(),
            stone_name: selectedStone?.name
          });
        }).filter((stone: any) => stone !== null),
        stone_kr: "",
        description: item.description || "",
        purity: item.purity,
        category: item.category,
        brand: item.brand,
        unit: item.unit,
        size: item.size,
        designer: item.designer,
        color: item.color
      };

      // Clean the product data
      const cleanedProduct = this.cleanObject(productData);

      return this.cleanObject({
        quantity: item.quantity || 1,
        line_total_amount: item.line_total_amount?.toString() || "0",
        product: cleanedProduct,
        metal_amount: item.metal_value?.toString() || "0",
        stone_amount: this.stonesArray.value.reduce((sum: number, stone: any) =>
          sum + (Number(stone.value) || 0), 0).toString(),
        id: item.id,
        is_returned: false,
        metal_value: item.metal_value?.toString() || "0",
        metal_rate: item.metal_rate?.toString() || "0",
        tax_amount: item.tax_amount?.toString() || "0"
      });
    }).filter(item => item !== null);

    // Build payments array - simplified structure for add operation
    const payments = this.paymentsArray.value
      .filter((payment: any) => payment.amount && Number(payment.amount) > 0)
      .map((payment: any) => {
        const paymentData = {
          payment_method: payment.payment_method,
          payment_date: payment.payment_date ?
            new Date(payment.payment_date).toISOString().slice(0, 10) : '',
          items: [{
            type: "Amount",
            is_fixed: true,
            amount: payment.amount?.toString() || "0"
          }]
        };

        return this.cleanObject(paymentData);
      }).filter((payment: any) => payment !== null);

    // Calculate totals
    const totalAmount = this.purchases.reduce((sum, item) =>
      sum + Number(item.line_total_amount || 0), 0);
    const totalWeight = this.purchases.reduce((sum, item) =>
      sum + Number(item.gross_weight || 0), 0);
    const taxAmount = this.purchases.reduce((sum, item) =>
      sum + Number(item.tax_amount || 0), 0);
    const totalMetalAmount = this.purchases.reduce((sum, item) =>
      sum + Number(item.metal_value || 0), 0);
    const totalStoneAmount = this.stonesArray.value.reduce((sum: number, stone: any) =>
      sum + (Number(stone.value) || 0), 0);
    const totalMetalWeight = this.purchases.reduce((sum, item) =>
      sum + Number(item.metal_weight || 0), 0);
    const totalItems = this.purchases.length;
    const totalPaidAmount = this.paymentsArray.value.reduce((sum: number, payment: any) =>
      sum + (Number(payment.amount) || 0), 0);
    const totalDueAmount = totalAmount - totalPaidAmount;

    // Build final payload for add operation
    const payload = {
      supplier_name: selectedSupplier?.name || "",
      order_date: orderDate,
      branch_name: selectedBranch?.name || "",
      branch: formValue.branch,
      supplier: formValue.supplier,
      total_amount: totalAmount.toString(),
      tax_amount: taxAmount.toString(),
      total_weight: totalWeight.toString(),
      type: formValue.type || "fixed",
      status: formValue.status || "pending",
      items: items,
      metal_weight: totalMetalWeight.toString(),
      total_items: totalItems.toString(),
      metal_making_charge: this.purchases.reduce((sum, item) => sum + Number(item.making_charge || 0), 0).toString(),
      attachment: formValue.attachment || "",
      total_metal_amount: totalMetalAmount.toString(),
      total_stone_amount: totalStoneAmount.toString(),
      reference_number: formValue.reference_number || "",
      total_due_amount: totalDueAmount.toString(),
      total_paid_amount: totalPaidAmount.toString(),
      total_paid_weight: "0"
    };

    // Only include payments if there are valid payments
    if (payments.length > 0) {
      (payload as any).payments = payments;
    }

    // Clean the entire payload
    const cleanedPayload = this.cleanObject(payload);

    // Convert to FormData
    const formDataPayload = this.toFormData(cleanedPayload);

    const request$ = this.productId && this.isEditMode
      ? this._accService.updatePurchase(this.productId, formDataPayload)
      : this._accService.addPurchase(formDataPayload);

    request$.subscribe({
      next: (response) => {
        console.log("response: ", response);
        this._router.navigate(["acc/purchases"])
      },
      error: (err) => {
        this._toasterService.showError(err.message ?? 'Unexpected error happened')
      }
    });
  }
}
