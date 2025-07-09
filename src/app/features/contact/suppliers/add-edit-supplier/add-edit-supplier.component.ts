import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../@services/contact.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-edit-supplier',
  imports: [SharedModule],
  templateUrl: './add-edit-supplier.component.html',
  styleUrl: './add-edit-supplier.component.scss'
})
export class AddEditSupplierComponent {
  addEditSupplierForm!: FormGroup;
  isEditMode = false;
  supplierId: string | number = '';
  customersGroup: any[] = [];
  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];

  constructor(
    private _contactService: ContactService,
    private _formBuilder: FormBuilder,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const supplierId = this._activeRoute.snapshot.paramMap.get('id');

    if (supplierId)
      this.supplierId = supplierId;
    this.initForm();
    if (this.supplierId) {
      this.loadSupplierData(this.supplierId);
      this.isEditMode = true
    }
  }

  private initForm(): void {
    this.addEditSupplierForm = this._formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      address: [''],
      tax_number: ['', Validators.required],
      land_line: ['', Validators.required],
      opening_balance_amount: ['', Validators.required],
      opening_balance_date: ['', Validators.required],
      phone: ['', Validators.required],
      cpr: ['', Validators.required],
    });
  }

  private loadSupplierData(supplierId: number | string): void {
    this._contactService.getSupplierById(supplierId).subscribe((supplier: any) => {
      this.addEditSupplierForm.patchValue({
        name: supplier?.name,
        email: supplier?.email,
        address: supplier?.address,
        opening_balance_amount: supplier?.opening_balance_amount,
        opening_balance_date: new Date(supplier?.opening_balance_date),
        tax_number: supplier?.tax_number,
        land_line: supplier?.land_line,
        phone: supplier?.phone,
        cpr_attachment: supplier?.cpr_attachment,
        cpr: supplier?.cpr,
      });
    });
  }
  onSubmit(): void {
    if (this.addEditSupplierForm.invalid) return;

    const formData = this.addEditSupplierForm?.value;

    if (this.isEditMode && this.supplierId) {
      this._contactService.updateSupplier(this.supplierId, formData).subscribe({
        next: res => console.log('User updated successfully', res),
        error: err => console.error('Error updating user', err)
      });
    } else {
      this._contactService.addSupplier(formData).subscribe({
        next: res => console.log('User created successfully', res),
        error: err => console.error('Error creating user', err)
      });
    }
  }
}
