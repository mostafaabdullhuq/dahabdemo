import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { AccService } from '../../@services/acc.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { forkJoin } from 'rxjs';
import { ToasterMsgService } from '../../../../core/services/toaster-msg.service';
import { Decimal } from 'decimal.js'

@Component({
  selector: 'app-add-edit-purchase',
  imports: [SharedModule, RouterLink],
  templateUrl: './add-edit-purchase.component.html',
  styleUrl: './add-edit-purchase.component.scss'
})
export class AddEditPurchaseComponent implements OnInit {
  addEditPurchaseForm!: FormGroup;
  isEditMode = false;
  purchaseId: string | number = '';
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
  private subscribedStones = new WeakSet<AbstractControl>();
  manualGoldPrice: any = 0
  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];
  selectedPurityValue: number = 1;
  editingIndex: number | null = null;

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
    const purchaseId = this._activeRoute.snapshot.paramMap.get('id');
    if (purchaseId) this.purchaseId = purchaseId;

    this.initForm();

    this.getLookupData();

    this.subscribeToFormChanges();

    if (this.purchaseId) {
      this.loadPurchaseData();
      this.isEditMode = true;
      this.paymentsArray.disable();
    }
  }

  private subscribeToFormChanges() {
    this.addEditPurchaseForm.get('branch')?.valueChanges.subscribe(branchId => {
      if (!branchId) return;

      forkJoin({
        goldPrice: this._accService.getGoldPrice(branchId),
        taxRate: this._accService.getBranchTax(branchId)
      }).subscribe(({ goldPrice, taxRate }) => {
        this.manualGoldPrice = goldPrice?.manual_gold_price


        this.addEditPurchaseForm.patchValue({
          // manual_gold_price: goldPrice,
          tax: taxRate?.tax_rate
        });

        if (!this.isEditMode) {
          this.paymentsArray.controls.forEach(control => {
            control.patchValue({
              gold_price: +this.manualGoldPrice
            })
          })
        }

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

    this.addEditPurchaseForm.get('purity')?.valueChanges.subscribe(purityId => {
      const selectedPurity = this.purities.find(p => p.id === purityId);
      this.selectedPurityValue = (selectedPurity?.purity_value || 1).toFixed(this.decimalInputs);
      this.addEditPurchaseForm.get('purity_rate')?.patchValue(selectedPurity?.purity_value)

      this.updateMetalRate();
      this.calculateMetalValue();
      this.calculateTax();
      this.calculateLineTotal();
    });

    this.addEditPurchaseForm.get('metal_weight')?.valueChanges.subscribe(() => {
      this.calculateMetalValue();
      this.calculateGrossWeight();
      this.calculateTax();
      this.calculateLineTotal();
    });

    this.addEditPurchaseForm.get('metal_rate')?.valueChanges.subscribe(() => {
      this.calculateMetalValue();
      this.calculateGrossWeight();
      this.calculateTax();
      this.calculateLineTotal();
    })

    this.addEditPurchaseForm.get('metal_value')?.valueChanges.subscribe(() => {
      this.calculateMetalValue();
      this.calculateGrossWeight();
      this.calculateTax();
      this.calculateLineTotal();
    })

    this.addEditPurchaseForm.get('retail_making_charge')?.valueChanges.subscribe(() => {
      this.calculateMetalValue();
      this.calculateGrossWeight();
      this.calculateTax();
      this.calculateLineTotal();
    })

    this.addEditPurchaseForm.get('making_charge')?.valueChanges.subscribe(() => {
      this.calculateMetalValue();
      this.calculateGrossWeight();
      this.calculateTax();
      this.calculateLineTotal();
    })

    this.addEditPurchaseForm.get('making_charge')?.valueChanges.subscribe(() => {
      this.calculateMetalValue();
      this.calculateGrossWeight();
      this.calculateTax();
      this.calculateLineTotal();
    });

    const stones = this.addEditPurchaseForm.get('stones') as FormArray;
    stones.valueChanges.subscribe(() => {
      this.calculateTax();
      this.watchStoneControls(); // Keep updating as stones are added
    });
  }

  getCategoryName(categoryId: number) {
    return (this.categories?.find(category => category.id === categoryId)?.name)
  }

  getDesignerName(designerId: number) {
    return (this.designers?.find(designer => designer.id === designerId)?.name)
  }

  getSizeName(sizeId: number) {
    return (this.sizes?.find(size => size.id === sizeId)?.name)
  }

  getColorName(colorId: number) {
    return (this.colors?.find(color => color.id === colorId)?.name)
  }

  getPurityName(purityId: number) {
    return (this.purities?.find(purity => purity.id === purityId)?.name)
  }

  getLookupData() {
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
      this.countries = data;
    });

    this._dropdownService.getMinimalCategories().subscribe(data => {
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
  }

  updateMetalRate() {
    const goldPrice = this.manualGoldPrice || 0;
    const purity = this.selectedPurityValue || 1;
    const rate = (+goldPrice * +purity).toFixed(this.decimalInputs);
    this.addEditPurchaseForm.patchValue({ metal_rate: rate });
  }

  calculateMetalValue() {
    const rate = this.addEditPurchaseForm.get('metal_rate')?.value || 0;
    const weight = this.addEditPurchaseForm.get('metal_weight')?.value || 0;
    this.addEditPurchaseForm.patchValue({ metal_value: (+rate * +weight).toFixed(this.decimalInputs) });
    this.calculateTax()
  }

  calculateTax(): void {
    const metalValue = Number(this.addEditPurchaseForm.get('metal_value')?.value) || 0;
    const taxRate = Number(this.addEditPurchaseForm.get('tax')?.value) || 0;
    const makingCharge = Number(this.addEditPurchaseForm.get('making_charge')?.value) || 0;
    const metalWeight = Number(this.addEditPurchaseForm.get('metal_weight')?.value) || 0;

    const stones = this.addEditPurchaseForm.get('stones') as FormArray;
    const stonesValueTotal = stones.controls.reduce((total, stone) => {
      const value = Number(stone.get('value')?.value) || 0;
      return total + value;
    }, 0);

    const subtotal = metalValue + (makingCharge * metalWeight) + stonesValueTotal;
    const taxAmount = subtotal * (taxRate / 100);

    this.addEditPurchaseForm.patchValue({
      tax_amount: +taxAmount.toFixed(this.decimalInputs)
    });
  }

  private watchStoneControls() {
    const stones = this.addEditPurchaseForm.get('stones') as FormArray;

    stones.controls.forEach((control: AbstractControl) => {
      if (this.subscribedStones.has(control)) return; // Avoid duplicates

      this.subscribedStones.add(control);

      control.get('weight')?.valueChanges.subscribe(() => {
        this.calculateGrossWeight();
        this.calculateLineTotal();
      });

      control.get('value')?.valueChanges.subscribe(() => {
        this.calculateTax();
        this.calculateLineTotal();
      });
    });
  }

  calculateGrossWeight() {
    const metalWeight = +this.addEditPurchaseForm.get('metal_weight')?.value || 0;
    const stones = this.addEditPurchaseForm.get('stones') as FormArray;
    const stoneWeight = stones.controls.reduce((acc, s) => acc + (+s.get('weight')?.value || 0), 0);
    this.addEditPurchaseForm.patchValue({ gross_weight: (metalWeight + +stoneWeight).toFixed(this.decimalInputs) });
  }

  calculateLineTotal() {
    const stones = this.addEditPurchaseForm.get('stones') as FormArray;

    const metalValue = Number(this.addEditPurchaseForm.get('metal_value')?.value) || 0;
    const metalWeight = Number(this.addEditPurchaseForm.get('metal_weight')?.value) || 0;
    const makingCharge = Number(this.addEditPurchaseForm.get('making_charge')?.value) || 0;
    const taxAmount = Number(this.addEditPurchaseForm.get('tax_amount')?.value) || 0;
    const stoneValues = stones.controls.reduce((acc, s) => acc + (+s.get('value')?.value || 0), 0);
    const total = metalValue + (makingCharge * metalWeight) + taxAmount + stoneValues;

    this.addEditPurchaseForm.patchValue({
      line_total_amount: (+total).toFixed(this.decimalInputs)
    });
  }

  private initForm(): void {
    this.addEditPurchaseForm = this._formBuilder.group({
      // Main purchase fields
      order_date: [new Date()],
      // expected_delivery_date: [null, Validators.required],
      branch: [null, Validators.required],
      supplier: [null, Validators.required],
      total_amount: [0],
      tax_amount: [{ value: 0, disabled: true }],
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
      line_total_amount: [{ value: 0, disabled: true }],
      metal_amount: [0],
      stone_amount: [0],
      is_returned: [false],
      metal_value: [0],
      metal_rate: [0],
      tax_amount_item: [0],

      // Form helpers (for UI only)
      tag_number: [null],
      name: [''],
      metal_weight: [0],
      purity_rate: [{ value: 0, disabled: true }],
      tax: [null],
      gross_weight: [{ value: 0, disabled: true }],
      manual_gold_price: [0],
      purity: [0],
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
      payment_date: [new Date()],
      payment_method: [null],
      salesman: [0],
      branch: [0],
      amount: [0],
      gold_price: [(+this.manualGoldPrice || 0), Validators.required],
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
    return this.addEditPurchaseForm.get('stones') as FormArray;
  }

  get paymentsArray(): FormArray {
    return this.addEditPurchaseForm.get('payments') as FormArray;
  }

  isPaymentEmpty() {
    return false;
    // return this.paymentsArray.controls.every(payment => !payment.get('amount')?.value) ||
    //   this.paymentsArray.controls.every(payment => !payment.get('payment_method')?.value) ||
    //   this.paymentsArray.controls.every(payment => !payment.get('payment_date')?.value)
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
    this.calculateTax();
    this.calculateLineTotal();
    this.calculateGrossWeight();
    this.calculateLineTotal();
  }

  removePayment(index: number) {
    this.paymentsArray.removeAt(index);
  }

  addPurchaseRow(): void {
    const formValue = this.addEditPurchaseForm.getRawValue();

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
    this.addEditPurchaseForm.patchValue({
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

    this.stonesArray.clear();
    this.addEditPurchaseForm.updateValueAndValidity();
  }

  private loadPurchaseData(): void {
    if (!this.purchaseId) return;

    this._accService.getPurchaseById(this.purchaseId).subscribe((purchase: any) => {
      // Patch basic form values
      this.addEditPurchaseForm.patchValue({
        supplier: purchase.supplier,
        branch: purchase.branch,
        type: purchase.type,
        order_date: purchase.order_date ? new Date(purchase.order_date) : new Date(),
        attachment: purchase.attachment,
        status: purchase.status,
        total_amount: purchase.total_amount,
        tax_amount: purchase.tax_amount,
        total_weight: purchase.total_weight,
        reference_number: purchase.reference_number
      });

      // Clear existing items and add new ones
      this.purchases = [];

      if (purchase.items && !!purchase.items.length) {
        // Add all items to purchases table
        purchase.items.forEach((item: any) => {
          const product = item.product;
          const refinedItem = {
            id: item.id,
            tag_number: product.tag_number,
            metal_rate: item.metal_rate,
            metal_value: item.metal_value,
            metal_weight: product.weight,
            purity: product.purity,
            purity_rate: product.purity_rate,
            category: product.category,
            making_charge: product.making_charge,
            retail_making_charge: product.retail_making_charge,
            // tax: product.tax, // todo
            tax_amount: item.tax_amount,
            gross_weight: product.gross_weight,
            line_total_amount: item.line_total_amount,
            color: product.color,
            size: product.size,
            name: product.name,
            designer: product.designer,
            country: this.countries.find(country => country.name === product.country)?.id, // Change to id
            description: product.description,
            stones: product.stones?.map((stone: any) => {
              return this.cleanObject({
                stone_id: stone.stone_id,
                value: stone.value?.toString(),
                weight: stone.weight?.toString(),
                retail_value: stone.retail_value?.toString(),
                stone_name: stone?.stone_name
              });
            }).filter((stone: any) => stone !== null),
          };

          this.purchases.push(refinedItem);
        });
      }

      // Handle payments
      this.paymentsArray.clear();
      this.stonesArray.clear();

      if (purchase.payments && !!purchase.payments.length) {
        purchase.payments.forEach((payment: any) => {
          const paymentItem = (payment.items && payment.items.length) ? payment.items[0] : {};

          const paymentGroup = this.createPayment();
          paymentGroup.patchValue({
            purchase_order: payment.purchase_order,
            payment_method: paymentItem.payment_method,
            amount: payment.total_amount,
            payment_date: payment.payment_date ? new Date(payment.payment_date) : new Date(),
            gold_price: payment.gold_price || 0
          });

          this.paymentsArray.push(paymentGroup);
        });
      }

      this.paymentsArray.disable();
    });
  }

  editPurchaseRow(item: any, index: number): void {
    // Store the index of the item being edited
    this.editingIndex = index;

    // Patch the form values with the selected item
    this.addEditPurchaseForm.patchValue({
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

    this.stonesArray.clear();

    if (item.stones && !!item.stones.length) {
      item.stones.forEach((stone: any) => {
        let stoneGroup = this.createStone();
        stoneGroup.patchValue({
          stone_id: stone.stone_id,
          stone_name: stone.stone_name,
          retail_value: stone.retail_value,
          value: stone.value,
          weight: stone.weight
        })
        this.stonesArray.push(stoneGroup);
        this.watchStoneControls(); // Watch the new one
      })
    }

    if (this.isEditMode) {
      this.stonesArray.disable();
    } else {
      this.stonesArray.enable();
    }
  }

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
    if (this.addEditPurchaseForm.invalid) {
      this.addEditPurchaseForm.markAllAsTouched();
      return;
    }

    const formValue = this.addEditPurchaseForm.value;

    // Format dates
    // const formattedDeliveryDate = formValue.expected_delivery_date ?
    //   new Date(formValue.expected_delivery_date).toISOString().slice(0, 10) : '';
    const orderDate = (formValue.order_date ? new Date(formValue.order_date) : new Date()).toISOString().split('T')[0];

    // Get related entity names
    const selectedSupplier = this.suppliers.find(s => s.id === formValue.supplier);
    const selectedBranch = this.branches.find(b => b.id === formValue.branch);
    let payload;

    if (this.isEditMode) {
      payload = {
        supplier_name: selectedSupplier?.name || "",
        order_date: orderDate,
        branch_name: selectedBranch?.name || "",
        branch: formValue.branch,
        supplier: formValue.supplier,
        type: formValue.type || "fixed",
        status: formValue.status || "pending",
        attachment: formValue.attachment || "",
        reference_number: formValue.reference_number || "",
      }
    } else {
      let totalStonesAmount = 0

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
          stones: item.stones,
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

        const stonesValue = +(productData.stones?.reduce((sum: number, stone: any) => sum + (Number(stone.value) || 0), 0).toString()) || 0;

        totalStonesAmount += stonesValue;

        // Clean the product data
        const cleanedProduct = this.cleanObject(productData);

        return this.cleanObject({
          quantity: item.quantity || 1,
          line_total_amount: item.line_total_amount?.toString() || "0",
          product: cleanedProduct,
          metal_amount: item.metal_value?.toString() || "0",
          stone_amount: stonesValue,
          id: item.id,
          is_returned: false,
          metal_value: item.metal_value?.toString() || "0",
          metal_rate: item.metal_rate?.toString() || "0",
          tax_amount: item.tax_amount?.toString() || "0",
          tax: this.taxRates.find((taxItem: any) => taxItem.rate === item.tax)?.id
        });
      }).filter(item => item !== null);

      // Build payments array - simplified structure for add operation
      const payments = this.paymentsArray.value
        // .filter((payment: any) => payment.amount && Number(payment.amount) > 0)
        .map((payment: any) => {
          const paymentData = {
            payment_date: payment.payment_date ? new Date(payment.payment_date).toISOString().slice(0, 10) : '',
            gold_price: payment.gold_price,
            items: [{
              type: "Amount",
              payment_method: payment.payment_method,
              is_fixed: true,
              amount: payment.amount?.toString() || "0",
            }]
          };

          return this.cleanObject(paymentData);
        }).filter((payment: any) => payment !== null);

      // Calculate totals with Decimal
      const totalAmount = this.purchases.reduce((sum, item) =>
        sum.plus(new Decimal(item.line_total_amount || 0)), new Decimal(0));

      const totalWeight = this.purchases.reduce((sum, item) =>
        sum.plus(new Decimal(item.gross_weight || 0)), new Decimal(0));

      const taxAmount = this.purchases.reduce((sum, item) =>
        sum.plus(new Decimal(item.tax_amount || 0)), new Decimal(0));

      const totalMetalAmount = this.purchases.reduce((sum, item) =>
        sum.plus(new Decimal(item.metal_value || 0)), new Decimal(0));

      const totalMetalWeight = this.purchases.reduce((sum, item) =>
        sum.plus(new Decimal(item.metal_weight || 0)), new Decimal(0));

      const totalItems = this.purchases.length;

      const totalPaidAmount = this.paymentsArray.value.reduce((sum: Decimal, payment: any) =>
        sum.plus(new Decimal(payment.amount || 0)), new Decimal(0));

      // totalAmount - totalPaidAmount
      const totalDueAmount = totalAmount.minus(totalPaidAmount);

      // Build final payload for add operation
      payload = {
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
        total_stone_amount: totalStonesAmount.toString(),
        reference_number: formValue.reference_number || "",
        total_due_amount: totalDueAmount.toString(),
        total_paid_amount: totalPaidAmount.toString(),
        total_paid_weight: "0"
      };

      // Only include payments if there are valid payments
      if (payments.length > 0) {
        (payload as any).payments = payments;
      }
    }

    // Clean the entire payload
    const cleanedPayload = this.cleanObject(payload);

    // Convert to FormData
    const formDataPayload = this.toFormData(cleanedPayload);

    const request$ = this.purchaseId && this.isEditMode
      ? this._accService.updatePurchase(this.purchaseId, formDataPayload)
      : this._accService.addPurchase(formDataPayload);

    request$.subscribe({
      next: (response) => {
        this._router.navigate(["acc/purchases"])
      },
      error: (err) => {
        this._toasterService.showError(err.message ?? 'Unexpected error happened')
      }
    });
  }
}
