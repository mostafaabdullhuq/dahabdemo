import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SettingsService } from '../../@services/settings.service';
import { SharedModule } from '../../../../shared/shared.module';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { ToasterMsgService } from '../../../../core/services/toaster-msg.service';

@Component({
  selector: 'app-add-edit-branch',
  imports: [SharedModule, RouterModule],
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
  branchData: any = null;

  nextPageUrl: string | null = null;
  isLoading = false;
  selectedMethods = [];

  constructor(
    private _sttingService: SettingsService,
    private _formBuilder: FormBuilder,
    private _activeRoute: ActivatedRoute,
    private _dropdownService: DropdownsService,
    private _router: Router,
    private _toasterService: ToasterMsgService
  ) { }
  customFieldsNames: any = [];

  ngOnInit(): void {
    const brandId = this._activeRoute.snapshot.paramMap.get('id');
    if (brandId) {
      this.brandId = brandId;
    }

    this.initForm();
    if (this.brandId) {
      this.loadBrandsData(this.brandId);
      this.isEditMode = true
    }

    this._dropdownService.getCountryCore().subscribe(res => {
      this.countries = res?.results;
      this.addEditBranchForm.get('country')?.valueChanges.subscribe(res => {
        //this.paymentMethods = [];
        this.addEditBranchForm.get('payment_methods')?.reset();
        const paymentMethodsParams = `country__icontains=${res}`
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
      this.customFieldsNames = res;

      if (this.isEditMode) {
        this.loadBrandsData(this.brandId);
      } else {
        this.loadCustomFields();
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
      logo: [""],
      vat_number: [""],
      cr_number: [""]
    });
    this.addCurrency(true);
  }

  private loadBrandsData(brandId: number | string): void {
    this._sttingService.getBranchById(brandId).subscribe((unit: any) => {
      if (!unit) return;

      this.branchData = unit;

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
        })) || [],
        logo: unit?.logo,
        vat_number: unit?.vat_number,
        cr_number: unit?.cr_number
      });

      // 2. Patch currencies
      const currenciesFormArray = this.addEditBranchForm.get('currencies') as FormArray;
      currenciesFormArray.clear();

      if (unit?.currencies?.length) {
        unit.currencies.forEach((currencyItem: any, idx: number) => {
          currenciesFormArray.push(this._formBuilder.group({
            currency: [currencyItem.currency, Validators.required],
            exchange_rate: [currencyItem.exchange_rate, Validators.required],
            default: [currencyItem.default, Validators.required]
          }));
        });
      }

      if (currenciesFormArray.length === 0) {
        this.addCurrency(true);
      }

      // 3. Patch custom_fields (if your backend returns an object like { key: value })
      const customFieldsArray = this.addEditBranchForm.get('custom_fields') as FormArray;
      customFieldsArray.clear();

      const fieldObj = unit?.custom_fields || []; // should be an object like { key: value }

      fieldObj.forEach((field: { field_key: string | number; value: string | number }) => {
        customFieldsArray.push(this._formBuilder.group({
          field_key: [field?.field_key],
          value: [field?.value || '']
        }));
      });

      if (!customFieldsArray.length) {
        this.loadCustomFields();
      }
    });
  }

  get currencies(): FormArray {
    return this.addEditBranchForm.get('currencies') as FormArray;
  }

  get customFieldsArray(): FormArray {
    return this.addEditBranchForm.get('custom_fields') as FormArray;
  }

  addCurrency(isDefault: boolean = false): void {
    const group = this._formBuilder.group({
      currency: ['', Validators.required],
      exchange_rate: ['', Validators.required],
      default: [!this.currencies.length ? true : isDefault]
    });
    this.currencies.push(group);
  }

  removeCurrency(index: number): void {
    this.currencies.removeAt(index);
  }

  loadCustomFields(): void {

    const fields = this.branchData?.custom_fields || [];

    if (!fields.length) {
      for (let i = 0; i < this.customFieldsNames.length; i++) {
        fields.push({
          field_name: `custom_field_${i + 1}`,
          value: ""
        });
      }
    }

    const formArray = this.addEditBranchForm.get('custom_fields') as FormArray;
    formArray.clear();

    fields.forEach((field: { field_name: string, value?: string }) => {
      formArray.push(this._formBuilder.group({
        field_key: [field.field_name],
        value: [field?.value ?? '']
      }));
    });
  }

  onSubmit(): void {
    if (this.addEditBranchForm.invalid) return;

    const rawValue = this.addEditBranchForm.value;

    // 🧾 Format currencies directly (already an array of objects)
    const currenciesArray = rawValue.currencies.map((item: any) => ({
      currency: item.currency,
      exchange_rate: item.exchange_rate,
      default: item?.default ?? false
    }));


    const paymentMethods = rawValue.payment_methods?.map((pm: any) => ({
      payment_method: pm.payment_method
    })) || [];

    const formattedData = {
      ...rawValue,
      currencies: currenciesArray,
      payment_methods: paymentMethods
    };

    const formData = new FormData();

    // Append each form field to FormData
    for (const key in formattedData) {
      if (formattedData.hasOwnProperty(key) && formattedData[key] !== null && formattedData[key] !== undefined) {
        if (Array.isArray(formattedData[key]) || typeof formattedData[key] === 'object') {
          formData.append(key, JSON.stringify(formattedData[key]));
        } else {
          formData.append(key, formattedData[key]);
        }
      }
    }

    // if the logo not changed and still an aws url, omit it because backend accepts File only
    if (typeof formData.get("logo") === "string") {
      formData.delete("logo")
    }

    // delete formattedData.logo

    if (this.isEditMode && this.brandId) {
      this._sttingService.updateBranch(this.brandId, formData).subscribe({
        next: res => this._router.navigate([`setting/branch`]),
        error: err => this._toasterService.showError(err.error?.message ?? 'Unexpected error happend.', "Failed to update branch settings")
      });
    } else {
      this._sttingService.addBranch(formData).subscribe({
        next: res => this._router.navigate([`setting/branch`]),
        error: err => this._toasterService.showError(err.error?.message ?? 'Unexpected error happend.', "Failed to add branch settings")
      });
    }
  }

  setDefaultCurrency(selectedIndex: number): void {
    this.currencies.controls.forEach((group, idx) => {
      const defaultControl = group.get('default');
      if (defaultControl) {
        defaultControl.setValue(idx === selectedIndex);
      }
    });
  }
}
