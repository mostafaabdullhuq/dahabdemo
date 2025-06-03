import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { InventoryService } from '../../@services/inventory.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-edit-brand',
  imports: [SharedModule],
  templateUrl: './add-edit-brand.component.html',
  styleUrl: './add-edit-brand.component.scss'
})
export class AddEditBrandComponent {
    addEditBrandForm!: FormGroup;
    isEditMode = false;
    brandId: string | number = '';
    categories:any[] =[];
  
    nextPageUrl: string | null = null;
    isLoading = false;
    selectedBranches =[];
  
    constructor(
      private _inventoryService: InventoryService,
      private _formBuilder: FormBuilder,
      private _activeRoute:ActivatedRoute,
      private _router:Router,
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
    }
  
    private initForm(): void {
      this.addEditBrandForm = this._formBuilder.group({
        name: ['', [Validators.required]],
        parent: [''],
      });
    }
  
    private loadBrandsData(brandId: number | string): void {
      this._inventoryService.getBrandById(brandId).subscribe((unit:any) => {
        this.addEditBrandForm.patchValue({
          name: unit?.name,
        });
      });
    }
  
    onSubmit(): void {
      if (this.addEditBrandForm.invalid) return;
  
      const formData = this.addEditBrandForm?.value;
      console.log(this.selectedBranches);
      
      if (this.isEditMode && this.brandId) {
        this._inventoryService.updateBrand(this.brandId, formData).subscribe({
        next: res => this._router.navigate([`inventory/brands`]),
          error: err => console.error('Error updating user', err)
        });
      } else {
        this._inventoryService.addBrand(formData).subscribe({
        next: res => this._router.navigate([`inventory/brands`]),
          error: err => console.error('Error creating user', err)
        });
      }
    }
}