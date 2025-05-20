import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-payment-expense',
  imports: [SharedModule],
  templateUrl: './payment-expense.component.html',
  styleUrl: './payment-expense.component.scss'
})
export class PaymentExpenseComponent implements OnInit{
  paymentData: any = [];
  paymentForm!: FormGroup;
  paymentTypeOptions:any = [
    {id:'Tag NO' , name:'Tag NO'},
    {id:'TTB' , name:'TTB'},
    {id:'Amount' , name:'Amount'},
    {id:'Scrap' , name:'Scrap'},
  ]
  visible: boolean = false;
  constructor(private _formBuilder:FormBuilder){}
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
      payment_date: ['', Validators.required],
      total_amount: ['', Validators.required],
      payment_method: [0, Validators.required],
      purity: [0],
      value: [0],
      purity_rate: [0],
      branch: [0],
      total_weight: [''],
      items: this._formBuilder.array([]),
    });
}
  patchPaymentData(data: any[]) {
  this.items.clear();
  data.forEach((item) => {
    const group = this.createItem(item);
    this.items.push(group);
    this.calculatePureWeight(group); // Trigger initial calculation
  });
}
   get items(): FormArray {
    return this.paymentForm.get('items') as FormArray;
  }

  submit(){

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
}
