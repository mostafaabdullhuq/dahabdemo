import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../@services/settings.service';
import { ActivatedRoute } from '@angular/router';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-edit-payment-options',
  imports: [SharedModule],
  templateUrl: './add-edit-payment-options.component.html',
  styleUrl: './add-edit-payment-options.component.scss'
})
export class AddEditPaymentOptionsComponent implements OnInit{
    addEditBrandForm!: FormGroup;
    isEditMode = false;
    brandId: string | number = '';
    country:any[] =[];
  accounts:any[] =[]
    nextPageUrl: string | null = null;
    isLoading = false;
    selectedBranches =[];
  
    constructor(
      private _settingService: SettingsService,
      private _formBuilder: FormBuilder,
      private _activeRoute:ActivatedRoute,
      private _dropdownService:DropdownsService,
    ) {}
  
    ngOnInit(): void {
      const brandId = this._activeRoute.snapshot.paramMap.get('id');
    if(brandId)
      this.brandId = brandId;
      this.initForm();
      if (this.brandId) {
        this.loadBrandsData(this.brandId);
        this.isEditMode = true
      }

      this._dropdownService.getCountries().subscribe(res=>{
        this.country = res?.results
      });
      this._dropdownService.getAccounts().subscribe(res=>{
        this.accounts = res
      })
    }
  
    private initForm(): void {
      this.addEditBrandForm = this._formBuilder.group({
        name: ['', [Validators.required]],
        country: [''],
        tax_rate: [''],
        account:['']
      });
    }
  
    private loadBrandsData(brandId: number | string): void {
      this._settingService.getPaymentOptionById(brandId).subscribe((unit:any) => {
        this.addEditBrandForm.patchValue({
          name: unit?.name,
          country: unit?.country,
        tax_rate: unit?.tax_rate,
        account:unit?.account
        });
      });
    }
  
    onSubmit(): void {
      if (this.addEditBrandForm.invalid) return;
  
      const formData = this.addEditBrandForm?.value;
      console.log(this.selectedBranches);
      
      if (this.isEditMode && this.brandId) {
        this._settingService.updatePaymentOption(this.brandId, formData).subscribe({
          next: res => console.log('User updated successfully', res),
          error: err => console.error('Error updating user', err)
        });
      } else {
        this._settingService.addPaymentOption(formData).subscribe({
          next: res => console.log('User created successfully', res),
          error: err => console.error('Error creating user', err)
        });
      }
    }
}