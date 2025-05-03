import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../@services/inventory.service';
import { ActivatedRoute } from '@angular/router';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-edit-product',
  imports: [SharedModule],
  templateUrl: './add-edit-product.component.html',
  styleUrl: './add-edit-product.component.scss'
})
export class AddEditProductComponent {
    addEditProductForm!: FormGroup;
    isEditMode = false;
    productId: string | number = '';
    stockPoints:any[]=[];
    units:any[]=[];
    designers:any[]=[];
    sizes:any[]=[];
    purities:any[]=[];
    categories:any[]=[];
    brands:any[]=[];

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
      const productId = this._activeRoute.snapshot.paramMap.get('id');
    console.log(productId);
    if(productId)
      this.productId = productId;
      this.initForm();
      if (this.productId) {
        this.loadProductData(this.productId);
        this.isEditMode = true
      }
      this.addStockItem();
      this.addCustomFields();
    }
  
    private initForm(): void {
      this.addEditProductForm = this._formBuilder.group({
        stones: ['', [Validators.required]],
        stone_kr: ['', [Validators.required]],
        stock_point: [''],
        is_active: [''],
        discount: [''],
        max_discount: [''],
        price: [''],
        tag_number: [''],
        making_charge: [''],
        color: [''],
        weight: [''],
        designer_id: [''],
        size_id: [''],
        purity_id: [''],
        unit_id: [''],
        brand_id: [''],
        category_id: [''],
        description: [''],
        name: [''],
        stock_info: this._formBuilder.array([]),
      image: [null, Validators.required]
      });
    }
  
    private loadProductData(productId: number | string): void {
      this._inventoryService.getProductById(productId).subscribe((product: any) => {
        this.addEditProductForm.patchValue({
          stones: product.stones,
          stone_kr: product.stone_kr,
          stock_point: product.stock_point,
          is_active: product.is_active,
          discount: product.discount,
          max_discount: product.max_discount,
          tag_number: product.tag_number,
          making_charge: product.making_charge,
          weight: product.weight,
          designer_id: product.designer_id,
          size_id: product.size_id,
          purity_id: product.purity_id,
          unit_id: product.unit_id,
          brand_id: product.brand_id,
          category_id: product.category_id,
          description: product.description,
          name: product.name
        });
        if (product.stock_info && Array.isArray(product.stock_info)) {
          product.stock_info.forEach((stock: { branch_id: any; stock_quantity: any; }) => {
            this.addStockItem({
              branch_id: stock.branch_id,
              stock_quantity: stock.stock_quantity
            });
          });
        }
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
      if (!this.addEditProductForm.contains(field.name)) {
        this.addEditProductForm.addControl(field.name, new FormControl(''));
      }
    });
  }

  // Map form controls to an array of objects
  private mapToCustomFieldsArray(): any[] {
    return this.customFields.map(field => ({
      name: field.name,
      value: this.addEditProductForm.get(field.name)?.value
    }));
  }

  
  onSubmit(): void {
    if (this.addEditProductForm.invalid) return;
  
    const formData = new FormData();
    const formValue = this.addEditProductForm.value;
  
    // Append simple fields
    Object.keys(formValue).forEach(key => {
      if (key === 'image' || key === 'stock_info') return; // handle these separately
  
      // Avoid appending null or undefined values
      if (formValue[key] !== null && formValue[key] !== undefined) {
        formData.append(key, formValue[key]);
      }
    });
  
    // Append image (assumed to be a File object)
    if (formValue.image) {
      formData.append('image', formValue.image);
    }
  
    // Append stock_info as JSON string if it's an array
    if (formValue.stock_info && Array.isArray(formValue.stock_info)) {
      formData.append('stock_info', JSON.stringify(formValue.stock_info));
    }
  
    // Send as FormData
    const request$ = this.isEditMode && this.productId
      ? this._inventoryService.updateProduct(this.productId, formData)
      : this._inventoryService.addProduct(formData);
  
    request$.subscribe({
      next: res => console.log(this.isEditMode ? 'Updated' : 'Created', res),
      error: err => console.error('Error', err)
    });
  }
  
  
  
    private createStockGroup(data: any = {}): FormGroup {
      return this._formBuilder.group({
        branch_id: [data.branch_id || '', Validators.required],
        stock_quantity: [data.stock_quantity || '', Validators.required]
      });
    }
    get stockInfoArray(): FormArray {
      return this.addEditProductForm.get('stock_info') as FormArray;
    }
    
    addStockItem(data: any = {}): void {
      this.stockInfoArray.push(this.createStockGroup(data));
    }
    
    removeStockItem(index: number): void {
      this.stockInfoArray.removeAt(index);
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
