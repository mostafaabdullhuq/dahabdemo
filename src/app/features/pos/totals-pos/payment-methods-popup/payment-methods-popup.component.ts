import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosStatusService } from '../../@services/pos-status.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { PosService } from '../../@services/pos.service';

@Component({
  selector: 'app-payment-methods-popup',
  standalone:false ,
  templateUrl: './payment-methods-popup.component.html',
  styleUrl: './payment-methods-popup.component.scss'
})
export class PaymentMethodsPopupComponent {
  visible: boolean = false;
  registerPosForm!: FormGroup;
  baymentMethods: any = [];
  @Output() onSubmitPayments = new EventEmitter<any[]>();

  constructor(private _posStatusService:PosStatusService, private _formBuilder: FormBuilder, private _dropdownsService: DropdownsService, private _posService: PosService) { }

  ngOnInit(): void {
    this.registerPosForm = this._formBuilder.group({
    payments: this._formBuilder.array([this.createPaymentFormGroup()])
  });
  }
  createPaymentFormGroup(): FormGroup {
  return this._formBuilder.group({
    amount: ['', Validators.required],
    payment_method: ['', Validators.required]
  });
}
get payments(): FormArray {
  return this.registerPosForm.get('payments') as FormArray;
}
addPayment() {
  this.payments.push(this.createPaymentFormGroup());
}

removePayment(index: number) {
  if (this.payments.length > 1) {
    this.payments.removeAt(index);
  }
}
  showDialog() {
    this.visible = true;
  }
 submitForm(form: FormGroup) {
    if (form.valid) {
      this.onSubmitPayments.emit(form.value.payments); // 👈 Emit data to parent
      this.visible = false;
    }
  }
}
