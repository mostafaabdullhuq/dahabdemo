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
  this._accService.getAccById(accId).subscribe((customer: any) => {
    this.addEditAccForm.patchValue({
      name: customer?.name,
      balance: customer?.cpr, // if balance = cpr in the backend
      account_type: customer?.group, // if group = account type
      date: customer?.date,
      description: customer?.description,
      parent_account: customer?.parent_account,
      sub_account: customer?.sub_account,
    });
  });
}

    onSubmit(): void {
   //   if (this.addEditAccForm.invalid) return;
    
      const formData = new FormData();
      const formValue = this.addEditAccForm.value;
    
      // Append standard fields (excluding custom_fields and image)
      Object.keys(formValue).forEach(key => {
        if (key !== 'custom_fields' && key !== 'image' && formValue[key] != null) {
          formData.append(key, formValue[key]);
        }
      });
    
      // Append image separately
      if (formValue.image) {
        formData.append('image', formValue.image);
      }
    
      // Prepare and append custom_fields payload from FormArray
      // const customFieldsPayload = formValue.custom_fields.map((field: any) => ({
      //   field_key: field.field_key.trim(),
      //   value: field.value
      // }));
      // formData.append('custom_fields', JSON.stringify(customFieldsPayload));
    
      // Send as FormData
      const request$ = this.isEditMode && this.accId
        ? this._accService.updateAcc(this.accId, formData)
        : this._accService.addAcc(formData);
    
      request$.subscribe({
        next: res => console.log(this.isEditMode ? 'Updated' : 'Created', res),
        error: err => console.error('Error', err)
      });
    }
    selectedImageFile: File | null = null;
previewUrl: string | ArrayBuffer | null = null;

onImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    this.selectedImageFile = input.files[0];

    const reader = new FileReader();
    reader.onload = e => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(this.selectedImageFile);
  }
}

}
