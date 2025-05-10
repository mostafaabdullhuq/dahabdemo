import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { ContactService } from '../../@services/contact.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-edit-customer',
  imports: [SharedModule],
  templateUrl: './add-edit-customer.component.html',
  styleUrl: './add-edit-customer.component.scss'
})
export class AddEditCustomerComponent {
    addEditCustomerForm!: FormGroup;
    isEditMode = false;
    customerId: string | number = '';
    customersGroup:any[]=[];
    nextPageUrl: string | null = null;
    isLoading = false;
    selectedBranches =[];
  
    constructor(
      private _contactService: ContactService,
      private _formBuilder: FormBuilder,
      private _dropdownService: DropdownsService,
      private _activeRoute:ActivatedRoute
    ) {}
  
    ngOnInit(): void {
      const customerId = this._activeRoute.snapshot.paramMap.get('id');
    console.log(customerId);
    if(customerId)
      this.customerId = customerId;
      this.initForm();
      if (this.customerId) {
        this.loadCustomerData(this.customerId);
        this.isEditMode = true
      }
      this.addCustomFields();

      this._dropdownService.getCustomersGroup().subscribe(data => {
      this.customersGroup = data?.results;
    });
    }
  
    private initForm(): void {
      this.addEditCustomerForm = this._formBuilder.group({
        name: ['',Validators.required],
        email: ['',Validators.required],
        address: [''],
        phone: ['',Validators.required],
        cpr_attachment: [''],
        cpr: ['',Validators.required],
        group: ['',Validators.required],
      });
    }
  
    private loadCustomerData(customerId: number | string): void {
      this._contactService.getCustomerById(customerId).subscribe((customer: any) => {
        this.addEditCustomerForm.patchValue({
          name: customer?.name,
        email: customer?.email,
        address:customer?.address,
        phone: customer?.phone,
        cpr_attachment: customer?.cpr_attachment,
        cpr: customer?.cpr,
        group: customer?.group,
        });
      });
    }
    customFields = [
      { name: 'custom_field_1', label: 'Custom Field 1' },
      { name: 'custom_field_2', label: 'Custom Field 2' },
      { name: 'custom_field_3', label: 'Custom Field 3' }
    ];
      // Dynamically add custom fields to the form
  private addCustomFields(): void {
    this.customFields.forEach(field => {
      if (!this.addEditCustomerForm.contains(field.name)) {
        this.addEditCustomerForm.addControl(field.name, new FormControl(''));
      }
    });
  }

  onSubmit(): void {
    console.log(this.addEditCustomerForm);
  
    if (this.addEditCustomerForm.invalid) return;
  
    const formData = new FormData();
    const formValue = this.addEditCustomerForm.value;
  
    // Append regular fields (excluding image and custom fields)
    Object.keys(formValue).forEach(key => {
      if (key === 'image' || key.startsWith('custom_field_')) return;
  
      if (formValue[key] !== null && formValue[key] !== undefined) {
        formData.append(key, formValue[key]);
      }
    });
  
    // Append image separately
    if (formValue.image) {
      formData.append('image', formValue.image);
    }
  
    // Prepare and append custom_fields
    const customFieldsPayload = this.customFields.map(field => ({
      field_key: field.name,
      value: formValue[field.name] || ''
    }));
    formData.append('custom_fields', JSON.stringify(customFieldsPayload));
  
    // Send as FormData
    const request$ = this.isEditMode && this.customerId
      ? this._contactService.updateCustomer(this.customerId, formData)
      : this._contactService.addCustomer(formData);
  
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
