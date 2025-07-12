import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccService } from '../../@services/acc.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { filter, Subscription, take } from 'rxjs';
import { SettingsService } from '../../../settings/@services/settings.service';

@Component({
  selector: 'app-payment-purchase',
  imports: [SharedModule],
  templateUrl: './payment-purchase.component.html',
  styleUrl: './payment-purchase.component.scss'
})
export class PaymentPurchaseComponent implements OnInit {
  paymentData: any = [];
  scrap: any = [];
  paymentMethod: any = [];
  paymentBranch: any;
  products: any = [];
  manualGoldPrice: any = 0;
  paymentForm!: FormGroup;
  ttbs: any = []
  branches: any = []
  selectedProduct: any;
  paymentTypeOptions: any = [
    { id: 'Tag No', name: 'Tag NO' },
    { id: 'TTB', name: 'TTB' },
    { id: 'Amount', name: 'Amount' },
    { id: 'Scrap', name: 'Scrap' },
  ]

  visible: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _accService: AccService,
    private _dropdownService: DropdownsService,
    private _settingService: SettingsService
  ) { }

  showDialog() {
    this.visible = true;
  }

  ngOnInit(): void {
    this.initForm();

    if (this.paymentData && Object.keys(this.paymentData).length > 0) {
      if (this.paymentData.branch) {
        this._settingService.getBranchById(this.paymentData.branch).subscribe(res => {
          this.paymentBranch = res;
        })
      }

      this.patchForm(this.paymentData); // patch main controls
      if (this.paymentData.items?.length > 0) {
        // this.patchPaymentData(this.paymentData.items); // patch items array
      }
    } else {
      this.addItem(); // add an empty item
    }

    this._dropdownService.getScraps().subscribe(res => {
      this.scrap = res;
    });

    this._dropdownService.getProducts().subscribe(res => {
      this.products = res?.results;
    });

    this._dropdownService.getTTBs().subscribe(res => {
      this.products = res?.results;
    });

    this._dropdownService.getBranches().subscribe(res => {
      this.branches = res?.results;
    });

    this._dropdownService.getPaymentMethods().subscribe(res => {
      this.paymentMethod = res?.results;
    });

    this._accService.getGoldPrice(this.paymentData?.branch)?.subscribe(res => {
      this.manualGoldPrice = +((+(res?.manual_gold_price ?? 0)).toFixed(3));
      this.paymentForm.get("gold_price")?.setValue(this.manualGoldPrice);
    });
  }

  onGoldPriceChange(event: any) {
    this.updateAllAmountsBasedOnGoldPrice();
  }

  updateAllAmountsBasedOnGoldPrice() {
    this.items.controls.forEach(group => this.calculateGroupAmount(group));
  }

  calculateGroupAmount(group: any) {
    const baseRate = +(this.paymentForm.get("gold_price")?.value ?? this.manualGoldPrice);

    const purity = group.get('purity')?.value;
    const pureWeight = parseFloat(group.get('pure_weight')?.value) || 1;

    let purityFactor = 1;
    if (purity === 22 || purity === '22k') {
      purityFactor = 0.916;
    } else if (purity === 21 || purity === '21k') {
      purityFactor = 0.88;
    } else if (purity === 18 || purity === '18k') {
      purityFactor = 0.75;
    }

    const metalRate = baseRate * purityFactor;
    const amount = pureWeight * metalRate;

    group.get('amount')?.setValue(amount.toFixed(3));
  }

  patchForm(data: any) {
    this.paymentForm.patchValue({
      purchase_order: data.purchase_order ?? 0,
      payment_date: data.payment_date ?? new Date(),
      total_amount: data.total_amount ?? '',
      payment_method: data.payment_method ?? 0,
      purity: data.purity ?? 0,
      value: data.value ?? 0,
      purity_rate: data.purity_rate ?? 0,
      branch: data.branch ?? 0,
      total_weight: data.total_weight ?? '',
    });
  }

  initForm() {
    return this.paymentForm = this._formBuilder.group({
      purchase_order: [0],
      payment_date: [''],
      total_amount: ['', Validators.required],
      payment_method: [0],
      purity: [0],
      value: [0],
      purity_rate: [0],
      total_weight: [''],
      branch: [''],
      items: this._formBuilder.array([]),
      gold_price: [this.manualGoldPrice]
    });
  }

  get items(): FormArray {
    return this.paymentForm.get('items') as FormArray;
  }

  patchPaymentData(data: any[]) {
    this.items.clear();
    data.forEach((item) => {
      const product = item.product || {};
      const group = this.createItem({
        purchase_payment: item.purchase_payment || 0,
        type: item.type || 'fixed',
        is_fixed: item.is_fixed ?? true,
        amount: item.metal_amount || item.amount || '0',
        description: product.description || '',
        product_id: product.id || 0,
        quantity: item.quantity || 1,
        weight: product.weight || '0',
        purity: product.purity || 0,
        value: this.calculateValueFromStones(product.stones),
        purity_rate: this.getPurityRate(product.purity), // Adjust this based on your logic
      });

      this.items.push(group);
      this.calculatePureWeight(group); // optional calculation
    });
  }

  getPurityRate(purity: number): number {
    const baseRate = 1; // or fetch from settings
    return purity ? purity * baseRate : 0;
  }

  calculateValueFromStones(stones: any[] = []): number {
    return stones.reduce((total, stone) => total + parseFloat(stone.value || '0'), 0);
  }

  createItem(data?: any): FormGroup {
    const group = this._formBuilder.group({
      purchase_payment: [0],
      type: ['', Validators.required],
      is_fixed: [true],
      amount: ['', Validators.required],
      description: [''],
      product_id: [0],
      payment_method: [0],
      quantity: [1, [Validators.required, Validators.min(1)]],
      pure_weight: [{ value: '0', disabled: true }],
      weight: ['0'],
      purity: [{ value: 0, disabled: true }],
      value: [''],
      purity_rate: [{ value: 0, disabled: true }],
      purity_name: [{ value: '', disabled: true }]
    });


    // Calculate pure weight dynamically
    group.get('weight')?.valueChanges.subscribe(() => this.calculatePureWeight(group));
    group.get('value')?.valueChanges.subscribe((res) => {
      this.calculatePureWeight(group)
    });

    group.get('purity_rate')?.valueChanges.subscribe(() => this.calculatePureWeight(group));

    let amountSubscription: Subscription | null = null;

    // Attach value logic when type changes
    group.get('type')?.valueChanges.subscribe((type: string | null) => {
      group.get('value')?.reset();
      amountSubscription?.unsubscribe();
      amountSubscription = null;

      switch (type) {
        case "Tag No":
          // disable amount, quantity, and weight
          group.get("amount")?.disable();
          group.get("quantity")?.disable();
          group.get("weight")?.disable();
          break;
        case "TTB":
          // disable amount, weight
          group.get("amount")?.disable();
          group.get("weight")?.disable();
          group.get("quantity")?.enable();
          break;
        case "Scrap":
          // disable amount, quantity
          group.get("amount")?.disable();
          group.get("quantity")?.disable();
          group.get("weight")?.enable();
          break;
        case "Amount":
          // disable quantity and weight
          group.get("quantity")?.disable();
          group.get("weight")?.disable();
          group.get("amount")?.enable();
          group.get("quantity")?.setValue(0);
          group.get("purity")?.setValue(0);
          group.get("purity_rate")?.setValue(0);
          group.get("weight")?.setValue('0');

          amountSubscription = group.get("amount")?.valueChanges.pipe().subscribe(res => {
            let pureWeight = ((+(res ?? 0)) / +(this.paymentForm.get("gold_price")?.value ?? 1)).toFixed(3);
            group.get("pure_weight")?.setValue(pureWeight, { emitEvent: false })
          }) || null;
          break;
        default:
          group.get("quantity")?.disable();
          group.get("weight")?.disable();
          group.get("amount")?.disable();
          break;
      }

      this.attachValueListener(group, type || '');
    });

    // Automatically update amount when pure_weight or purity changes
    group.get('pure_weight')?.valueChanges.subscribe(() => {
      this.updateSingleAmount(group);
    });

    group.get('purity')?.valueChanges.subscribe(() => {
      this.updateSingleAmount(group);
      group?.get("purity_name")?.setValue(this.selectedProduct?.purity_name ?? '-')
    });

    return group;
  }

  updateSingleAmount(group: FormGroup) {
    if (!this.manualGoldPrice) return;

    const baseRate = +(this.paymentForm.get("gold_price")?.value ?? this.manualGoldPrice);
    const purity = group.get('purity')?.value;
    const pureWeight = parseFloat(group.get('pure_weight')?.value) || 0;

    let purityFactor = 1;
    if (purity === 22 || purity === '22k' || purity === '22K') {
      purityFactor = 0.916;
    } else if (purity === 21 || purity === '21k' || purity === '21K') {
      purityFactor = 0.88;
    } else if (purity === 18 || purity === '18k' || purity === '18K') {
      purityFactor = 0.75;
    }

    const metalRate = baseRate * purityFactor;
    const amount = pureWeight * metalRate;

    group.get('amount')?.setValue(amount.toFixed(3), { emitEvent: false });
  }

  attachValueListener(group: FormGroup, type: string): void {
    const valueControl = group.get('value');

    // Remove previous listener by resetting (will only trigger one-time setup here)
    valueControl?.valueChanges?.pipe(take(1)).subscribe((selectedId: number) => {
      if (type === 'Tag No') {
        this.selectedProduct = this.products.find((p: { id: number; }) => p.id === selectedId);
        group.patchValue({
          product_id: this.selectedProduct?.id || 0,
          weight: this.selectedProduct?.gross_weight || '0',
          purity_rate: this.selectedProduct?.purity_value || 0,
        });
      } else if (type === 'TTB') {
        this.selectedProduct = this.ttbs.find((p: { id: number; }) => p.id === selectedId);
        group.patchValue({
          product_id: this.selectedProduct?.id || 0,
          weight: this.selectedProduct?.gross_weight || '0',
          purity_rate: this.selectedProduct?.purity_value || 0,
        })
      } else if (type === 'Scrap') {
        this.selectedProduct = this.scrap.find((s: { id: number; }) => s.id === selectedId);
        group.patchValue({
          product_id: this.selectedProduct?.id || 0,
          weight: this.selectedProduct?.weight || '0',
          purity_rate: this.selectedProduct?.purity_value || 0,
        });
      } else if (type === 'Amount') {
        group.patchValue({
          payment_method: selectedId
        });
        this.selectedProduct = "amount";
      } else {
        this.selectedProduct = null;
      }

      if (type && type !== 'Amount' && this.selectedProduct) {
        group.patchValue({
          purity: this.selectedProduct.purity
        })
      }
    });
  }

  calculatePureWeight(group: FormGroup) {
    const weight = parseFloat(group.get('weight')!.value) || 0;
    // const value = parseFloat(group.get('value')!.value) || 0;
    const purityRate = parseFloat(group.get('purity_rate')!.value) || 0;

    const type = group.get("type")!.value;

    let pureWeight = (weight * purityRate);

    pureWeight = (type === "Scrap") ? (pureWeight - (pureWeight * 1 / 100)) : pureWeight

    group.get('pure_weight')!.setValue(pureWeight.toFixed(3), { emitEvent: false });

    this.calculateGroupAmount(group);
  }

  addItem(data?: any) {
    this.items.push(this.createItem(data));
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  get totalAmount(): number {
    return this.items.controls.reduce((sum, group) => {
      const amount = parseFloat(group.get('amount')?.value) || 0;
      return sum + amount;
    }, 0);
  }

  get totalWeight(): number {
    return this.items.controls.reduce((sum, group) => {
      const weight = parseFloat(group.get('weight')?.value) || 0;
      return sum + weight;
    }, 0);
  }

  submit() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const formValue = this.paymentForm.getRawValue();
    const formattedDate = new Date(formValue.payment_date).toISOString().slice(0, 10);

    console.log("gold_price: ", formValue.gold_price);


    const payload = {
      purchase_order: this.paymentData?.id,
      payment_date: formattedDate,
      branch: formValue.branch,
      gold_price: formValue.gold_price,
      items: formValue.items.map((item: any) => {
        console.log("item: ", item);

        const base = {
          //purchase_payment: item.purchase_payment,
          type: item.type,
          is_fixed: item.type === 'Amount',
          amount: item.amount.toString(),
          description: item.description,
          quantity: item.quantity,
          pure_weight: item.pure_weight.toString(),
          weight: item.weight.toString(),
        };

        if (item?.type === 'Scrap') {
          const scrapBase = {
            type: item.type,
            is_fixed: item.type === 'Amount',
            description: item.description,
            quantity: item.quantity,
            pure_weight: (item.pure_weight).toString(),
            weight: item.weight.toString(),
          };

          return {
            ...scrapBase,
            product_id: item.value
          };
        }

        // Conditionally include product_id or payment_method
        if (item.type === 'Tag No' || item.type === 'Scrap') {
          return {
            ...base,
            product_id: item.value
          };
        } else if (item.type === 'Amount') {
          return {
            ...base,
            payment_method: item.value
          };
        } else {
          // For other types like TTB
          return {
            ...base
          };
        }

      })
    };

    this._accService.addPurchasePayment(payload).subscribe({
      next: (res) => {
        this.paymentForm.reset();
        this.visible = false;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
