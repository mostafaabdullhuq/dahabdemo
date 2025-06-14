import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { ContactService } from '../../contact/@services/contact.service';
import { AccService } from '../@services/acc.service';

@Component({
  selector: 'app-add-edit-acc',
  imports: [SharedModule],
  templateUrl: './add-edit-acc.component.html',
  styleUrl: './add-edit-acc.component.scss'
})
export class AddEditAccComponent implements OnInit{
  visible: boolean = false;
  
  showDialog() {
    this.visible = true;
  }

      addEditAccForm!: FormGroup;
    isEditMode = false;
    accId: string | number = '';
    accounts:any[]=[];
    subAcc:any[]=[];
    nextPageUrl: string | null = null;
    isLoading = false;
    selectedBranches =[];
    customFields:any = [];

    constructor(
      private _accService: AccService,
      private _formBuilder: FormBuilder,
      private _dropdownService: DropdownsService,
      private _activeRoute:ActivatedRoute
    ) {}
  
    ngOnInit(): void {
    console.log(this.accId);
    if(this.accId)
      this.accId = this.accId;
      this.initForm();
      if (this.accId) {
        this.loadAccData(this.accId);
        this.isEditMode = true
      }

      this._dropdownService.getMainAccounts().subscribe(data => {
      this.accounts = data;
    });
    this._dropdownService.getAccounts().subscribe(res => {
      this.subAcc = res || [];
  
      if (this.isEditMode) {
        this.loadAccData(this.accId);
      }
    });
  }
  
  private initForm(): void {
    this.addEditAccForm = this._formBuilder.group({
      name: ['', Validators.required],
      balance: ['', Validators.required], // Renamed from 'cpr'
      account_type: [''], // Instead of 'group'
      date: [''],
      description: [''],
      parent_account: [''],
      sub_account: [''],
    });
  }
   
    
  
private loadAccData(accId: number | string): void {
  this._accService.getAccById(accId).subscribe((acc: any) => {
    this.addEditAccForm.patchValue({
      name: acc?.name,
      balance: acc?.balance, // if 'cpr' is backend balance field
      account_type: acc?.account_type,
      date: new Date(acc?.created_at),
      description: acc?.description,
      parent_account: acc?.parent,
      sub_account: acc?.subaccounts?.length ? acc.subaccounts[0].id : null
    });
  });
}

onSubmit(): void {
  if (this.addEditAccForm.invalid) {
    this.addEditAccForm.markAllAsTouched();
    return;
  }

  const formValue = this.addEditAccForm.value;

  const payload = {
    name: formValue.name,
    account_type: formValue.account_type,
    balance: formValue.balance,
    date: formValue.date,
    description: formValue.description,
    subaccounts: formValue.sub_account ? [{ id: formValue.sub_account }] : []
  };

  const request$ = this.isEditMode && this.accId
    ? this._accService.updateAcc(this.accId, payload)
    : this._accService.addAcc(payload);

  request$.subscribe({
    next: res => console.log(this.isEditMode ? 'Updated' : 'Created', res),
    error: err => console.error('Error', err)
  });
}
}
