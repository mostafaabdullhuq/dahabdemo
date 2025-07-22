import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccService } from '../../@services/acc.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { SettingsService } from '../../../settings/@services/settings.service';
import { PurchasePayment, PurchasePaymentItem } from './payment-purchase.models';

@Component({
  selector: 'app-payment-purchase',
  imports: [SharedModule],
  templateUrl: './payment-purchase.component.html',
  styleUrl: './payment-purchase.component.scss'
})
export class PaymentPurchaseComponent implements OnInit {
  purchaseData: any = [];
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
  ];

  purchaseOrderId!: number;

  paymentId?: number;
  editMode: boolean = false;

  visibility = new BehaviorSubject<boolean>(false);
  visibility$ = this.visibility.asObservable();

  constructor(
    private _formBuilder: FormBuilder,
    private _accService: AccService,
    private _dropdownService: DropdownsService,
    private _settingService: SettingsService
  ) { }

  showDialog() {
    this.visibility.next(true);
  }

  ngOnInit(): void {
    this.initForm();

    if (this.editMode && !!this.paymentId) {
      this._accService.getPurchasePaymentById(this.paymentId).subscribe((payment: PurchasePayment) => {
        const branchId = (+payment.branch) || null;
        this.purchaseOrderId = payment.purchase_order;
        if (branchId) {
          this.getBranchLookupData(branchId);
        }
        this.loadFormData(payment);
        this.loadPaymentItems(payment);
      });
    } else {
      this.getBranchLookupData(this.purchaseData?.branch);

      if (this.purchaseData && Object.keys(this.purchaseData).length > 0) {
        this.purchaseOrderId = this.purchaseData.id;
        this.patchPurchaseDataToForm(this.purchaseData); // patch main controls
      } else {
        this.addItem(); // add an empty item
      }
    }

    this._dropdownService.getBranches().subscribe(res => {
      this.branches = res?.results;
    });
  }

  getBranchLookupData(branchId: number) {
    this._settingService.getBranchById(branchId).subscribe(res => {
      this.paymentBranch = res;
    });

    this._dropdownService.getPurchasePaymentScraps(null, `branch=${branchId || ""}`).subscribe(res => {
      this.scrap = res;
    });

    this._dropdownService.getPurchasePaymentProducts(null, `branch=${branchId || ""}`).subscribe(res => {
      this.products = res?.results;
    });

    this._dropdownService.getPurchasePaymentTTBs(null, `branch=${branchId || ""}`).subscribe(res => {
      this.ttbs = res;
    });

    this._dropdownService.getPaymentMethods(`branch=${branchId || ""}`).subscribe(res => {
      this.paymentMethod = res?.results;
    });

    this._accService.getGoldPrice(branchId)?.subscribe(res => {
      this.manualGoldPrice = +((+(res?.manual_gold_price ?? 0)).toFixed(3));

      if (!this.editMode || !this.paymentId) {
        this.paymentForm.get("gold_price")?.setValue(this.manualGoldPrice);
      }
    });
  }

  onGoldPriceChange(event: any) {
    this.updateAllAmountsBasedOnGoldPrice();
  }

  updateAllAmountsBasedOnGoldPrice() {
    this.paymentItemsArray.controls.forEach(group => this.calculateGroupAmount(group));
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

  patchPurchaseDataToForm(data: any) {
    this.paymentForm.patchValue({
      purchase_order: data.id ?? 0,
      payment_date: new Date(data.order_date) || new Date(),
      branch: data.branch ?? 0,
    });
  }

  initForm() {
    this.paymentForm = this._formBuilder.group({
      purchase_order: [null],
      payment_date: [new Date(), Validators.required],
      branch: [null],
      gold_price: [0, Validators.required],
      items: this._formBuilder.array([]),
    }, { validators: this.atLeastOneItem });
  }

  private atLeastOneItem(form: FormGroup) {
    let itemsArray = form.get('items') as FormArray;
    if (!itemsArray?.controls?.length) {
      return { atLeastOneItem: true }
    }

    return null;
  }

  get paymentItemsArray(): FormArray {
    return this.paymentForm.get('items') as FormArray;
  }

  loadFormData(payment: PurchasePayment) {
    this.paymentForm.patchValue({
      purchase_order: payment.purchase_order,
      payment_date: new Date(payment.payment_date),
      branch: payment.branch,
      gold_price: payment.gold_price,
    })
  }

  loadPaymentItems(payment: PurchasePayment) {
    this.paymentItemsArray.clear();

    payment?.items?.forEach((item: PurchasePaymentItem) => {
      const product = item.product;

      let itemData = {
        purchase_payment: item.purchase_payment || null,
        is_fixed: item.is_fixed,
        amount: item.amount ?? 0,
        description: item.description,
        product_id: item.product?.id || null,
        payment_method: item.payment_method,
        quantity: item.quantity ?? 0,
        pure_weight: item.pure_weight ?? 0,
        weight: item.weight ?? 0,
        purity: product?.purity ?? 0,
        purity_rate: product?.purity_value ?? 0,
        purity_name: product?.purity_name ?? null,
        value: item.type === "Amount" ? item.payment_method : (product?.id || null)
      }

      const group = this.createItem();

      group.patchValue({
        type: item.type,
      });

      if (item.type === "TTB") {
        group.get("quantity")?.setValidators([Validators.min(0), Validators.max(this.selectedProduct?.stock_quantity ?? 9999)]);
        group.get("quantity")?.updateValueAndValidity();
      }

      group.patchValue(itemData, { emitEvent: false })

      this.paymentItemsArray.push(group);
      // this.calculatePureWeight(group); // optional calculation
    });
  }

  getPurityRate(purity: number): number {
    const baseRate = 1; // or fetch from settings
    return purity ? purity * baseRate : 0;
  }

  calculateValueFromStones(stones: any[] = []): number {
    return stones.reduce((total, stone) => total + parseFloat(stone.value || '0'), 0);
  }

  createItem(): FormGroup {
    const group = this._formBuilder.group({
      purchase_payment: [null],
      type: [null, Validators.required],
      is_fixed: [true],
      amount: [0, Validators.required],
      description: [null],
      product_id: [null],
      payment_method: [null],
      quantity: [1, [Validators.required, Validators.min(1)]],
      pure_weight: [{ value: 0, disabled: true }],
      weight: [0],
      purity: [{ value: 0, disabled: true }],
      value: [null],
      purity_rate: [{ value: 0, disabled: true }],
      purity_name: [{ value: null, disabled: true }]
    });

    this.attachGroupListeners(group);
    return group;
  }

  attachGroupListeners(group: FormGroup) {


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
    const quantityControl = group.get("quantity");
    let subscription: Subscription | undefined;

    valueControl?.valueChanges?.subscribe((selectedId: number) => {
      if (type === 'Tag No') {
        this.selectedProduct = this.products.find((p: { id: number; }) => p.id === selectedId);
        group.patchValue({
          product_id: this.selectedProduct?.id || 0,
          weight: this.selectedProduct?.weight || '0',
          purity_rate: this.selectedProduct?.purity_value || 0,
        });
      } else if (type === 'TTB') {
        this.selectedProduct = this.ttbs.find((p: { id: number; }) => p.id === selectedId);
        group.patchValue({
          product_id: this.selectedProduct?.id || 0,
          weight: this.selectedProduct?.total_weight || '0',
          purity_rate: this.selectedProduct?.purity_value || 0,
          quantity: this.selectedProduct?.stock_quantity || 0,
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

      if (type === "TTB") {
        subscription = quantityControl?.valueChanges.subscribe(value => {
          group.patchValue({
            weight: +this.selectedProduct?.weight * +value || 0
          })
        })
        quantityControl?.setValidators([Validators.min(0), Validators.max(+this.selectedProduct?.stock_quantity || 0)]);
        quantityControl?.updateValueAndValidity();
      } else {
        quantityControl?.setValidators(Validators.min(1));
        quantityControl?.updateValueAndValidity();
        subscription?.unsubscribe();
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

  addItem() {
    this.paymentItemsArray.push(this.createItem());
  }

  removeItem(index: number) {
    this.paymentItemsArray.removeAt(index);
  }

  get totalAmount(): number {
    return this.paymentItemsArray.controls.reduce((sum, group) => {
      const amount = parseFloat(group.get('amount')?.value) || 0;
      return sum + amount;
    }, 0);
  }

  get totalWeight(): number {
    return +this.paymentItemsArray.controls.reduce((sum, group) => {
      const weight = parseFloat(group.get('weight')?.value) || 0;
      return sum + weight;
    }, 0).toFixed(3);
  }

  submit() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const formValue = this.paymentForm.getRawValue();
    const formattedDate = new Date(formValue.payment_date).toISOString().slice(0, 10);

    const payload = {
      purchase_order: this.purchaseOrderId,
      payment_date: formattedDate,
      branch: formValue.branch,
      gold_price: formValue.gold_price,
      items: formValue.items.map((item: any) => {
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
            is_fixed: false,
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
        if (item.type === 'Tag No' || item.type === 'Scrap' || item.type === "TTB") {
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

    let request$;

    if (this.editMode && this.paymentId) {
      request$ = this._accService.updatePurchasePayment(this.paymentId, payload);
    } else {
      request$ = this._accService.addPurchasePayment(payload);
    }

    request$.subscribe({
      next: (res) => {
        this.paymentForm.reset();
        this.visibility.next(false);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
