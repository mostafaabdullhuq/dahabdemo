import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from '../../@services/settings.service';
import { SharedModule } from '../../../../shared/shared.module';
import { DropdownsService } from '../../../../core/services/dropdowns.service';

@Component({
  selector: 'app-add-edit-branch',
  imports: [SharedModule],
  templateUrl: './add-edit-branch.component.html',
  styleUrl: './add-edit-branch.component.scss'
})
export class AddEditBranchComponent implements OnInit {
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
    this._dropdownService.getCountries().subscribe(res => {
      this.countries = res;
      this.addEditBranchForm.get('country')?.valueChanges.subscribe(res=>{
        this.paymentMethods= [];
        this.addEditBranchForm.get('payment_methods')?.reset();
        const paymentMethodsParams=`country__icontains=${res}`
        this._dropdownService.getPaymentMethods(paymentMethodsParams).subscribe(res => {
          this.paymentMethods = res?.results;
        })
      })
    })
    this._dropdownService.getCurrencies().subscribe(res => {
      this.currenciesList = res?.results;
    });
   
    this._dropdownService.getTaxes().subscribe(res => {
      this.taxRates = res?.results;
    });
    this._sttingService.getBranchCustomLabel().subscribe(res => {
      this.customFields = res;
      this.loadCustomFields();

      if (this.isEditMode) {
        this.loadBrandsData(this.brandId);
      }
    });
  }
  private initForm(): void {
    this.addEditBranchForm = this._formBuilder.group({
      name: ['', [Validators.required]],
      address_line: [''],
      country: [''],
      mobile: [''],
      landline: [''],
      email: ['', [Validators.required]],
      tax_rate: [''],
      manual_gold_price: [''],
      custom_fields: this._formBuilder.array([]),
      currencies: this._formBuilder.array([]),
      payment_methods: [],
    });
    this.addCurrency()
  }

 private loadBrandsData(brandId: number | string): void {
  this._sttingService.getBranchById(brandId).subscribe((unit: any) => {
    if (!unit) return;

    // 1. Patch simple fields
    this.addEditBranchForm.patchValue({
      name: unit?.name,
      address_line: unit?.address_line,
      country: unit?.country,
      mobile: unit?.mobile,
      landline: unit?.landline,
      email: unit?.email,
      tax_rate: unit?.tax_rate,
      manual_gold_price: unit?.manual_gold_price,
      payment_methods: unit?.payment_methods?.map((pm: any) => ({
        payment_method: pm.payment_method
      })) || []
    });

    // 2. Patch currencies
    const currenciesFormArray = this.addEditBranchForm.get('currencies') as FormArray;
    currenciesFormArray.clear();
    if (unit?.currencies?.length) {
      unit.currencies.forEach((currencyItem: any) => {
        currenciesFormArray.push(this._formBuilder.group({
          currency: [currencyItem.currency, Validators.required],
          exchange_rate: [currencyItem.exchange_rate, Validators.required],
        }));
      });
    }

    // 3. Patch custom_fields (if your backend returns an object like { key: value })
    const customFieldsArray = this.addEditBranchForm.get('custom_fields') as FormArray;
    customFieldsArray.clear();
    const fieldObj = unit?.custom_fields || []; // should be an object like { key: value }

    unit?.custom_fields.forEach((field: { field_name: string | number; value:string | number }) => {
      customFieldsArray.push(this._formBuilder.group({
        field_key: [field?.field_name],
        value: [field?.value || '']
      }));
    });
  });
}

  get currencies(): FormArray {
    return this.addEditBranchForm.get('currencies') as FormArray;
  }

  get customFieldsArray(): FormArray {
    return this.addEditBranchForm.get('custom_fields') as FormArray;
  }
  addCurrency(): void {
    const group = this._formBuilder.group({
      currency: ['', Validators.required],
      exchange_rate: ['', Validators.required],
    });
    this.currencies.push(group);
  }

  removeCurrency(index: number): void {
    this.currencies.removeAt(index);
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
    }, []);

    // 🧾 Format currencies directly (already an array of objects)
    const currenciesArray = rawValue.currencies.map((item: any) => ({
      currency: item.currency,
      exchange_rate: item.exchange_rate
    }));

 const paymentMethods = rawValue.payment_methods?.map((pm: any) => ({
  payment_method: pm
})) || [];

const formattedData = {
  ...rawValue,
  custom_fields: customFieldsObj,
  currencies: currenciesArray,
  payment_methods: paymentMethods
};
    if (this.isEditMode && this.brandId) {
      this._sttingService.updateBranch(this.brandId, formattedData).subscribe({
        next: res => console.log('User updated successfully', res),
        error: err => console.error('Error updating user', err)
      });
    } else {
      this._sttingService.addBranch(formattedData).subscribe({
        next: res => console.log('User created successfully', res),
        error: err => console.error('Error creating user', err)
      });
    }
  }
}
