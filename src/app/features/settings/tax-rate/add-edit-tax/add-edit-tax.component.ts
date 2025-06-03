import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../@services/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { DropdownsService } from '../../../../core/services/dropdowns.service';

@Component({
  selector: 'app-add-edit-tax',
  imports: [SharedModule],
  templateUrl: './add-edit-tax.component.html',
  styleUrl: './add-edit-tax.component.scss'
})
export class AddEditTaxComponent implements OnInit{
    addEditBrandForm!: FormGroup;
    isEditMode = false;
    brandId: string | number = '';
    country:any[] =[];
  
    nextPageUrl: string | null = null;
    isLoading = false;
    selectedBranches =[];
  
    constructor(
      private _settingService: SettingsService,
      private _formBuilder: FormBuilder,
      private _activeRoute:ActivatedRoute,
      private _dropdownService:DropdownsService,
      private _router:Router
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

      this._dropdownService.getCountryCore().subscribe(res=>{
        this.country = res?.results
      })
    }
  
    private initForm(): void {
      this.addEditBrandForm = this._formBuilder.group({
      //  name: ['', [Validators.required]],
      //  country: [''],
        tax: [''],
      });
    }
  
    private loadBrandsData(brandId: number | string): void {
      this._settingService.getTaxRateById(brandId).subscribe((unit:any) => {
        this.addEditBrandForm.patchValue({
       //   name: unit?.name,
       //   country: unit?.country,
          tax: unit?.tax,
        });
      });
    }
  
    onSubmit(): void {
      if (this.addEditBrandForm.invalid) return;
  
      const formData = this.addEditBrandForm?.value;
      console.log(this.selectedBranches);
      
      if (this.isEditMode && this.brandId) {
        this._settingService.updateTaxRate(this.brandId, formData).subscribe({
          next: res => console.log('User updated successfully', res),
          error: err => console.error('Error updating user', err)
        });
      } else {
        this._settingService.addTaxRate(formData).subscribe({
          next: res => {console.log('User created successfully', res)
    this._router.navigate([`setting/tax-rate`]);
          },
          error: err => {
    this._router.navigate([`setting/tax-rate`]);
          }
        });
      }
    }
}