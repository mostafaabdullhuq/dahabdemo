import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { ContactService } from '../../../features/contact/@services/contact.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-customer-popup',
  imports: [SharedModule],
  templateUrl: './add-customer-popup.component.html',
  styleUrl: './add-customer-popup.component.scss'
})
export class AddCustomerPopupComponent {
    addEditCustomerForm!: FormGroup;
    isEditMode = false;
    customerId: string | number = '';
    customersGroup:any[]=[];
    nextPageUrl: string | null = null;
    isLoading = false;
    selectedBranches =[];
    customFields:any = [];
  visible: boolean = false;

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

      this._dropdownService.getCustomersGroup().subscribe(data => {
      this.customersGroup = data?.results;
    });
    this._contactService.getCustomerCustomLabel().subscribe(res => {
      this.customFields = res || [];
      this.buildCustomFieldsForm(); // Build form controls after loading labels
  
      if (this.isEditMode) {
        this.loadCustomerData(this.customerId);
      }
    });
  }
    showDialog() {
    this.visible = true;
  }
    private initForm(): void {
      this.addEditCustomerForm = this._formBuilder.group({
        name: ['',Validators.required],
        email: [''],
        address: [''],
        phone: ['',Validators.required],
        cpr_attachment: ['',Validators.required],
        cpr: ['',Validators.required],
        group: [''],
        custom_fields:this._formBuilder.array([])
      });
    }
    get customFieldsFormArray(): FormArray {      
      return this.addEditCustomerForm.get('custom_fields') as FormArray;
    }
    
    private buildCustomFieldsForm(): void {
      const customFieldsFormArray = this.addEditCustomerForm.get('custom_fields') as FormArray;
      customFieldsFormArray.clear(); // Clear previous if any
      console.log(this.customFields);
      
      this.customFields.forEach((field: { field_name: any; }) => {
        const group = new FormGroup({
          field_key: new FormControl(field?.field_name),
          value: new FormControl('') // or set default value if editing
        });
        customFieldsFormArray.push(group);
        console.log(customFieldsFormArray);
        
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
        // Patch custom fields
    const customFieldsArray = this.addEditCustomerForm.get('custom_fields') as FormArray;
    customer.custom_fields?.forEach((field: any, index: number) => {
      const group = customFieldsArray.at(index) as FormGroup;
      if (group) {
        group.patchValue({ value: field.value });
      }
    });
      });
    }
@Output() customerAdded = new EventEmitter<any>();

    onSubmit(): void {
   //   if (this.addEditCustomerForm.invalid) return;
    
      const formData = new FormData();
      const formValue = this.addEditCustomerForm.value;
    
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
      const request$ = this.isEditMode && this.customerId
        ? this._contactService.updateCustomer(this.customerId, formData)
        : this._contactService.addCustomer(formData);
    
      request$.subscribe({
        next: res => {
          this.visible = false;
      this.customerAdded.emit(res);
        },
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

getCustomFieldControl(index: number): FormControl {
  return this.customFieldsFormArray.at(index) as FormControl;
}
  }