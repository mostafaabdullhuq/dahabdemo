import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { AccService } from '../../@services/acc.service';

@Component({
  selector: 'app-payment-expense',
  imports: [SharedModule],
  templateUrl: './payment-expense.component.html',
  styleUrl: './payment-expense.component.scss'
})
export class PaymentExpenseComponent implements OnInit{
  paymentData: any = [];
  paymentMethods: any = [];
  paymentForm!: FormGroup;
  paymentTypeOptions:any = [
    {id:'Tag NO' , name:'Tag NO'},
    {id:'TTB' , name:'TTB'},
    {id:'Amount' , name:'Amount'},
    {id:'Scrap' , name:'Scrap'},
  ]
  visible: boolean = false;
  constructor(private _formBuilder:FormBuilder, private _dropdownSrvice:DropdownsService , private _accService:AccService){}
  showDialog() {
    this.visible = true;
  }
 ngOnInit(): void {
  this.initForm();

  if (this.paymentData && Object.keys(this.paymentData).length > 0) {
    this.patchForm(this.paymentData); // patch main controls
  } 

  this._dropdownSrvice.getPaymentMethods().subscribe(res=>{
this.paymentMethods=res
  })
}
patchForm(data: any) {
  this.paymentForm.patchValue({
    attachment:data?.attachment,
      note:data?.note,
      paid_on: data?.paid_on,
      amount:data?.amount,
      payment_method:data?.payment_method,
  });
}
initForm(){
  return this.paymentForm = this._formBuilder.group({
      attachment: [0],
      note: [''],
      paid_on: ['', Validators.required],
      amount: [0, Validators.required],
      payment_method: [0, Validators.required],
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

submit() {
  if (this.paymentForm.invalid) {
    this.paymentForm.markAllAsTouched();
    return;
  }

  const formData = new FormData();

  const formValue = this.paymentForm.value;

  // Append each form field to FormData
  formData.append('attachment', formValue.attachment ?? ''); // assume attachment is a File object or '' if empty
  formData.append('note', formValue.note);
  formData.append('paid_on', formValue.paid_on);
  formData.append('amount', formValue.amount.toString());
  formData.append('payment_method', formValue.payment_method.toString());
  this._accService.addExpensePayment(this.paymentData?.id , formData).subscribe()
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
