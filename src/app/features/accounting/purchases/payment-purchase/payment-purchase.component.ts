import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccService } from '../../@services/acc.service';

@Component({
  selector: 'app-payment-purchase',
  imports: [SharedModule],
  templateUrl: './payment-purchase.component.html',
  styleUrl: './payment-purchase.component.scss'
})
export class PaymentPurchaseComponent implements OnInit{
  paymentData: any = [];
  paymentForm!: FormGroup;
  paymentTypeOptions:any = [
    {id:'Tag NO' , name:'Tag NO'},
    {id:'TTB' , name:'TTB'},
    {id:'Amount' , name:'Amount'},
    {id:'Scrap' , name:'Scrap'},
  ]
  visible: boolean = false;
  constructor(private _formBuilder:FormBuilder , private _accService:AccService){}
  showDialog() {
    this.visible = true;
  }
 ngOnInit(): void {
  this.initForm();

  if (this.paymentData && Object.keys(this.paymentData).length > 0) {
    this.patchForm(this.paymentData); // patch main controls
    if (this.paymentData.items?.length > 0) {
      this.patchPaymentData(this.paymentData.items); // patch items array
    }
  } else {
    this.addItem(); // add an empty item
  }
}
patchForm(data: any) {
  console.log(data);
  
  this.paymentForm.patchValue({
    purchase_order: data.purchase_order ?? 0,
    payment_date: data.payment_date ?? '',
    total_amount: data.total_amount ?? '',
    payment_method: data.payment_method ?? 0,
    purity: data.purity ?? 0,
    value: data.value ?? 0,
    purity_rate: data.purity_rate ?? 0,
    branch: data.branch ?? 0,
    total_weight: data.total_weight ?? '',
  });
}
initForm(){
  return this.paymentForm = this._formBuilder.group({
      purchase_order: [0],
      payment_date: [''],
      total_amount: ['', Validators.required],
      payment_method: [0],
      purity: [0],
      value: [0],
      purity_rate: [0],
      total_weight: [''],
      items: this._formBuilder.array([]),
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
    purchase_payment: [data?.purchase_payment || 0],
    type: [data?.type || 'fixed', Validators.required],
    is_fixed: [data?.is_fixed ?? true],
    amount: [data?.amount || '', Validators.required],
    description: [data?.description || ''],
    product_id: [data?.product_id || 0],
    quantity: [data?.quantity || 1, [Validators.required, Validators.min(1)]],
    pure_weight: [data?.pure_weight || '0'],
    weight: [data?.weight || '0'],
    purity: [data?.purity || 0],
    value: [data?.value || 0],
    purity_rate: [data?.purity_rate || 0],
  });

  // 🔁 Subscribe to changes that affect pure_weight
  group.get('weight')?.valueChanges.subscribe(() => {
    this.calculatePureWeight(group);
  });

  group.get('value')?.valueChanges.subscribe(() => {
    this.calculatePureWeight(group);
  });

  group.get('purity_rate')?.valueChanges.subscribe(() => {
    this.calculatePureWeight(group);
  });

  return group;
}
calculatePureWeight(group: FormGroup) {
  const weight = parseFloat(group.get('weight')!.value) || 0;
  const value = parseFloat(group.get('value')!.value) || 0;
  const purityRate = parseFloat(group.get('purity_rate')!.value) || 0;

  const pureWeight = weight * (value * purityRate);
  group.get('pure_weight')!.setValue(pureWeight.toFixed(3), { emitEvent: false });
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

  const formValue = this.paymentForm.value;
const formattedDate = new Date(formValue.payment_date).toISOString().slice(0, 10);

  const payload = {
    purchase_order: this.paymentData?.id,
    payment_date: formattedDate,
    total_amount: this.totalAmount.toString(), // calculated from getter
    // payment_method: formValue.payment_method,
    total_weight: this.totalWeight.toString(), // calculated from getter
    items: formValue.items.map((item: any) => ({
      purchase_payment: item.purchase_payment,
      type: item.type,
      is_fixed: item.type === 'Amount' ? true : false,
      amount: item.amount.toString(),
      description: item.description,
      product_id: item.product_id,
      quantity: item.quantity,
      pure_weight: item.pure_weight.toString(),
      weight: item.weight.toString()
    }))
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
