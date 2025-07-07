import { Component } from '@angular/core';
import { SettingsService } from '../../@services/settings.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { ToasterMsgService } from '../../../../core/services/toaster-msg.service';

@Component({
  selector: 'app-business-setting',
  imports: [SharedModule],
  templateUrl: './business-setting.component.html',
  styleUrl: './business-setting.component.scss'
})
export class BusinessSettingComponent {
  addEditBusinessForm!: FormGroup;
  isEditMode = false;
  busnissId: string | number = '';
  categories: any[] = [];
  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];
  timeZones: any[] = [];
  currencies: any[] = [];
  timeFormat = [{ id: 1, name: "12 Hour" }, { id: 2, name: "24 Hour" }];
  dateFormat = [
    {
      id: 1,
      name: "dd-mm-yyyy",
    },
    {
      id: 2,
      name: "mm-dd-yyyy",
    },
    {
      id: 3,
      name: "dd/mm/yyyy",
    },
    {
      id: 4,
      name: "mm/dd/yyyy",
    },
  ];
  months = [
    { id: 1, name: "January" },
    { id: 2, name: "February" },
    { id: 3, name: "March" },
    { id: 4, name: "April" },
    { id: 5, name: "May" },
    { id: 6, name: "June" },
    { id: 7, name: "July" },
    { id: 8, name: "August" },
    { id: 9, name: "September" },
    { id: 10, name: "October" },
    { id: 11, name: "November" },
    { id: 12, name: "December" },
  ];
  constructor(
    private _settingsService: SettingsService,
    private _dropdownsService: DropdownsService,
    private _formBuilder: FormBuilder,
    private _toasterService: ToasterMsgService
  ) { }

  ngOnInit(): void {
    const busnissId = JSON.parse(localStorage.getItem('user') || '')?.business
    if (busnissId)
      this.busnissId = busnissId;
    this.initForm();
    if (this.busnissId) {
      this.loadBrandsData(this.busnissId);
      this.isEditMode = true
    }

    this._dropdownsService.getTimeZones().subscribe(res => {
      this.timeZones = res
    })
    this._dropdownsService.getCurrencies().subscribe(res => {
      this.currencies = res?.results
    })
  }

  private initForm(): void {
    this.addEditBusinessForm = this._formBuilder.group({
      name: ['', [Validators.required]],
      financial_year_start: [''],
      currency: [''],
      time_zone: [''],
      time_format: [''],
      date_format: [''],
      contact_number: [''],
      alternate_contact_number: [''],
      logo: [''],
      website: [''],
    });
  }

  private loadBrandsData(businessId: number | string): void {
    this._settingsService.getBusinessById(businessId).subscribe((unit: any) => {
      if (unit) {
        this.addEditBusinessForm.patchValue({
          name: unit.name || '',
          financial_year_start: +unit.financial_year_start || '',
          currency: unit.currency || '',
          time_zone: unit.time_zone || '',
          time_format: unit.time_format || '',
          date_format: unit.date_format || '',
          contact_number: unit.contact_number || '',
          alternate_contact_number: unit.alternate_contact_number || '',
          website: unit.website || '',
          logo: unit.logo || '',
        });
      }
    });
  }

  onSubmit(): void {
    if (this.addEditBusinessForm.invalid) return;

    const formValues = this.addEditBusinessForm.value;
    const formData = new FormData();

    // Append each form field to FormData
    for (const key in formValues) {
      if (formValues.hasOwnProperty(key) && formValues[key] !== null && formValues[key] !== undefined) {
        formData.append(key, formValues[key]);
      }
    }

    // Optionally append selected branches if needed
    if (this.selectedBranches) {
      formData.append('branches', JSON.stringify(this.selectedBranches));
    }

    // if the logo not changed and still an aws url, omit it because backend accepts File only
    if (typeof formData.get("logo") === "string") {
      formData.delete("logo")
    }

    if (this.busnissId) {
      this._settingsService.updateBusiness(this.busnissId, formData).subscribe({
        next: res => this._toasterService.showSuccess("Business has been updated successfully."),
        error: err => this._toasterService.showError(err.error?.message ?? 'Unexpected error happend.', "Failed to update business settings")
      });
    } else {
      this._settingsService.addBusiness(formData).subscribe({
        next: res => this._toasterService.showSuccess("Business has been added successfully."),
        error: err => this._toasterService.showError(err.error?.message ?? 'Unexpected error happend.', "Failed to add business settings")
      });
    }
  }
}
