import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { InventoryService } from '../../@services/inventory.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-edit-category',
  imports: [SharedModule],
  templateUrl: './add-edit-category.component.html',
  styleUrl: './add-edit-category.component.scss'
})
export class AddEditCategoryComponent {
    addEditCategoryForm!: FormGroup;
    isEditMode = false;
    categoryId: string | number = '';
    categories:any[] =[];
  
    nextPageUrl: string | null = null;
    isLoading = false;
    selectedBranches =[];
  
    constructor(
      private _inventoryService: InventoryService,
      private _formBuilder: FormBuilder,
      private _dropdownService: DropdownsService,
      private _activeRoute:ActivatedRoute
    ) {}
  
    ngOnInit(): void {
      const categoryId = this._activeRoute.snapshot.paramMap.get('id');
    if(categoryId)
      this.categoryId = categoryId;
      this.initForm();
      if (this.categoryId) {
        this.loadCategoryData(this.categoryId);
        this.isEditMode = true
      }
      this._dropdownService.getCategories().subscribe(data => {
        this.categories = data?.results;
      });
    }
  
    private initForm(): void {
      this.addEditCategoryForm = this._formBuilder.group({
        name: ['', [Validators.required]],
        parent: [''],
      });
    }
  
    private loadCategoryData(categoryId: number | string): void {
      this._inventoryService.getCategoryById(categoryId).subscribe((unit:any) => {
        this.addEditCategoryForm.patchValue({
          name: unit?.name,
          parent: unit?.parent,
        });
      });
    }
  
    onSubmit(): void {
      if (this.addEditCategoryForm.invalid) return;
  
      const formData = this.addEditCategoryForm?.value;
      console.log(this.selectedBranches);
      
      if (this.isEditMode && this.categoryId) {
        this._inventoryService.updateCategory(this.categoryId, formData).subscribe({
          next: res => console.log('User updated successfully', res),
          error: err => console.error('Error updating user', err)
        });
      } else {
        this._inventoryService.addCategory(formData).subscribe({
          next: res => console.log('User created successfully', res),
          error: err => console.error('Error creating user', err)
        });
      }
    }
}
