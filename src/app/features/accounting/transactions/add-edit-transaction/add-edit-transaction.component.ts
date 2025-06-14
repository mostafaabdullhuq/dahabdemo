import { filter } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccService } from '../../@services/acc.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-edit-transaction',
  imports: [SharedModule],
  templateUrl: './add-edit-transaction.component.html',
  styleUrl: './add-edit-transaction.component.scss'
})
export class AddEditTransactionComponent implements OnInit {
  addEditCustomerForm!: FormGroup;
  isEditMode = false;
  transId: string | number = '';
  customersGroup: any[] = [];
  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];
  customFields: any = [];
  paymentMethods: any = [];
  customers: any = [];
  constructor(
    private _accService: AccService,
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
    private _activeRoute: ActivatedRoute,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    const transId = this._activeRoute.snapshot.paramMap.get('id');
    console.log(transId);
    if (transId)
      this.transId = transId;
    this.initForm();
    if (this.transId) {
      this.loadTransData(this.transId);
      this.isEditMode = true
    }
    this._dropdownService.getPaymentMethods().subscribe(res => {
      this.paymentMethods = res?.results
    });
    this._dropdownService.getCustomers().subscribe(res => {
      this.customers = res?.results;
    })
  }

  private initForm(): void {
    this.addEditCustomerForm = this._formBuilder.group({
      customer: [''],
      payment_date: [''],
      payment_method: [''],
      payment_status: ['']
    });
  }


orderProducts: any[] = [];
allDataOfTrans:any =[]
private loadTransData(transId: number | string): void {
  this._accService.getTransactionById(transId).subscribe((customer: any) => {
    const selectedPaymentMethod = this.paymentMethods?.find(
      (pm: { name: string }) => pm?.name === customer?.payment_method
    );    
    this.addEditCustomerForm.patchValue({
      customer: customer?.customer,
      payment_date: new Date(customer?.payment_date),
      payment_method: selectedPaymentMethod?.id, // patch the whole object if your form expects it
      payment_status: customer?.payment_status
    });
        this.orderProducts = customer.order_products || [];
this.allDataOfTrans=customer
  });
}
onSubmit(): void {
  if (this.addEditCustomerForm.invalid) return;

  const formValue = this.addEditCustomerForm.value;

  // Send JSON directly
  const request$ = this._accService.updateTransaction(this.transId, formValue);

  request$.subscribe({
    next: res =>{
      this._router.navigate([`acc/transactions`])
    },
    error: err => console.error('Error', err)
  });
}
}
