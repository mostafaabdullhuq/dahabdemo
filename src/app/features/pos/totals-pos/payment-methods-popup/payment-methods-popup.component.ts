import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  constructor(private _posStatusService:PosStatusService, private _formBuilder: FormBuilder, private _dropdownsService: DropdownsService, private _posService: PosService) { }

  ngOnInit(): void {
    this.registerPosForm = this._formBuilder.group({
      amount: ['', Validators.required],
      payment_method: ['', Validators.required],
    });
  }
  showDialog() {
    this.visible = true;
  }

  submitForm(form: FormGroup) {
    this._posService.addShift(form.value).subscribe((res:any) => {
      this.visible = false;
      if (res) {
        this._posStatusService.setShiftStatus(true);
      }
    })
  }
}
