import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../@services/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-edit-currency',
  imports: [SharedModule],
  templateUrl: './add-edit-currency.component.html',
  styleUrl: './add-edit-currency.component.scss'
})
export class AddEditCurrencyComponent implements OnInit{
  addEditBranchForm!: FormGroup;
  isEditMode = false;
  brandId: string | number = '';
  currenciesList: any[] = [];
  countries: any[] = [];
  paymentMethods: any[] = [];
  taxRates: any[] = [];

  nextPageUrl: string | null = null;
  isLoading = false;
  selectedMethods = [];

  constructor(
    private _sttingService: SettingsService,
    private _formBuilder: FormBuilder,
    private _activeRoute: ActivatedRoute,
    private _dropdownService: DropdownsService,
    private _router: Router,
  ) { }
  customFields: any = [];

  ngOnInit(): void {
    const brandId = this._activeRoute.snapshot.paramMap.get('id');
    if (brandId)
      this.brandId = brandId;
    this.initForm();
    if (this.brandId) {
      this.loadBrandsData(this.brandId);
      this.isEditMode = true
    }
    this._sttingService.getBranchCustomLabel().subscribe(res => {
      this.customFields = res;
      this.loadCustomFields();

      if (this.isEditMode) {
        this.loadBrandsData(this.brandId);
      }
    });

    this._dropdownService.getCurrencies().subscribe(res=>{
      this.currenciesList= res?.results
    })
  }
  private initForm(): void {
    this.addEditBranchForm = this._formBuilder.group({
      currency: ['', [Validators.required]],
    });
  }

 private loadBrandsData(brandId: number | string): void {
  this._sttingService.getCurrencyById(brandId).subscribe((unit: any) => {
    if (!unit) return;

    // 1. Patch simple fields
    this.addEditBranchForm.patchValue({
      currency: unit?.currency,
    
    });


    // 3. Patch custom_fields (if your backend returns an object like { key: value })
    const customFieldsArray = this.addEditBranchForm.get('custom_fields') as FormArray;
    customFieldsArray.clear();
    const fieldObj = unit?.custom_fields || {}; // should be an object like { key: value }

    unit?.custom_fields.forEach((field: { field_name: string | number; value:string | number }) => {
      customFieldsArray.push(this._formBuilder.group({
        field_key: [field.field_name],
        value: [field.value || '']
      }));
    });
  });
}

  loadCustomFields(): void {
    const fields = this.customFields || [];
    const formArray = this.addEditBranchForm.get('custom_fields') as FormArray;
    formArray.clear();

    fields.forEach((field: { field_name: any; }) => {
      formArray.push(this._formBuilder.group({
        field_key: [field.field_name],
        value: ['']
      }));
    });
  }
  onSubmit(): void {
    if (this.addEditBranchForm.invalid) return;

    const rawValue = this.addEditBranchForm.value;

    // 🔁 Format custom_fields as an object: { field_key: value, ... }
    const customFieldsObj = rawValue.custom_fields.reduce((acc: any, field: any) => {
      if (field.field_key && field.value != null) {
        acc[field.field_key] = field.value;
      }
      return acc;
    }, {});

    // 🧾 Format currencies directly (already an array of objects)
    const currenciesArray = rawValue.currencies.map((item: any) => ({
      currency: item.currency,
      exchange_rate: item.exchange_rate
    }));

    const formattedData = {
      ...rawValue,
      custom_fields: customFieldsObj,
      currencies: currenciesArray,
    };

    if (this.isEditMode && this.brandId) {
      this._sttingService.updateBranch(this.brandId, formattedData).subscribe({
        next: res => this._router.navigate([`setting/currencies`]),
        error: err => console.error('Error updating user', err)
      });
    } else {
      this._sttingService.addBranch(formattedData).subscribe({
        next: res => this._router.navigate([`setting/currencies`]),
        error: err => console.error('Error creating user', err)
      });
    }
  }
}
