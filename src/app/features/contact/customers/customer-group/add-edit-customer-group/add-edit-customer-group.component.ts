import { Component } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../../@services/contact.service';
import { DropdownsService } from '../../../../../core/services/dropdowns.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-edit-customer-group',
  imports: [SharedModule],
  templateUrl: './add-edit-customer-group.component.html',
  styleUrl: './add-edit-customer-group.component.scss'
})
export class AddEditCustomerGroupComponent {
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
    }
  
    private initForm(): void {
      this.addEditCustomerForm = this._formBuilder.group({
        name: ['',Validators.required],
        description: ['',Validators.required],
      });
    }
  
    private loadCustomerData(customerId: number | string): void {
      this._contactService.getCustomerById(customerId).subscribe((customer: any) => {
        this.addEditCustomerForm.patchValue({
          name: customer?.name,
          description: customer?.description,
        });
      });
    }

  onSubmit(): void {
    if (this.addEditCustomerForm.invalid) return;

    const formData = this.addEditCustomerForm?.value;
    console.log(this.selectedBranches);
    
    if (this.isEditMode && this.customerId) {
      this._contactService.updateCustomerGroup(this.customerId, formData).subscribe({
        next: res => console.log('User updated successfully', res),
        error: err => console.error('Error updating user', err)
      });
    } else {
      this._contactService.addCustomerGroup(formData).subscribe({
        next: res => console.log('User created successfully', res),
        error: err => console.error('Error creating user', err)
      });
    }
  }
  }