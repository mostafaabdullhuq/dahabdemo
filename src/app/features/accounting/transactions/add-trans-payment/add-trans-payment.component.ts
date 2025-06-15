import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { AccService } from '../../@services/acc.service';

@Component({
  selector: 'app-add-trans-payment',
  imports: [SharedModule],
  templateUrl: './add-trans-payment.component.html',
  styleUrl: './add-trans-payment.component.scss'
})
export class AddTransPaymentComponent {
  visible: boolean = false;
  registerPosForm!: FormGroup;
  baymentMethods: any = [];
  branches: any = [];
transId:any;
  constructor(private _accService:AccService, private _formBuilder: FormBuilder, private _dropdownsService: DropdownsService) { }

  ngOnInit(): void {
    this.registerPosForm = this._formBuilder.group({
    amount: ['', Validators.required],
    payment_method: ['', Validators.required],
    branch:['', Validators.required]
  });
  this._dropdownsService.getPaymentMethods().subscribe(res=>{
    this.baymentMethods = res?.results;
  })
  this._dropdownsService.getBranches().subscribe(res=>{
    this.branches = res?.results;
  })
  }

  showDialog() {
    this.visible = true;
  }



 submitForm(form: FormGroup) {
    if (form.valid) {
      this._accService.addPaymentTransaction(this.transId, form.value).subscribe(res=>{
        this.visible = false;
      })
    }
  }
}
