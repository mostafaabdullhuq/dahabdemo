import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosStatusService } from '../../@services/pos-status.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { PosService } from '../../@services/pos.service';
import { PosSharedService } from '../../@services/pos-shared.service';

@Component({
  selector: 'app-payment-methods-popup',
  standalone: false,
  templateUrl: './payment-methods-popup.component.html',
  styleUrl: './payment-methods-popup.component.scss'
})
export class PaymentMethodsPopupComponent {
  visible: boolean = false;
  registerPosForm!: FormGroup;
  typeOfPayment: string = ''
  baymentMethods: any = [];
  totalWithVat: any = 0;
  @Output() onSubmitPayments = new EventEmitter<any>();

  constructor(private _posSharedService: PosSharedService, private _posStatusService: PosStatusService, private _formBuilder: FormBuilder, private _dropdownsService: DropdownsService, private _posService: PosService) { }

  ngOnInit(): void {
    this.registerPosForm = this._formBuilder.group({
      payments: this._formBuilder.array([this.createPaymentFormGroup()])
    });
    this._posSharedService.grandTotalWithVat$.subscribe(vat => {
      this.totalWithVat = +vat;
    });
  }

  get isCreditOverpaid(): boolean {
    if (this.typeOfPayment !== 'credit') return false;

    const totalPaymentAmount = this.payments.controls.reduce((acc, ctrl) => {
      const val = parseFloat(ctrl.get('amount')?.value) || 0;
      return acc + val;
    }, 0);

    return totalPaymentAmount >= this.totalWithVat;
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
  get totalPayable(): number {
    return this.payments.controls.reduce((acc, control) => {
      const amount = +control.get('amount')?.value || 0;
      return acc + amount;
    }, 0);
  }

  get changeReturn(): number {
    const change = this.totalPayable - this.totalWithVat;
    return change > 0 ? change : 0;
  }

  get balance(): number {
    const bal = this.totalWithVat - this.totalPayable;
    return bal > 0 ? bal : 0;
  }
  submitForm(form: FormGroup) {
    if (form.valid) {
      console.log(form.value.payments);

      this.onSubmitPayments.emit(form.value.payments);
      this.visible = false;
    }
  }
}
