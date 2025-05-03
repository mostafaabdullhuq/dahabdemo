import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
      });
    }
    
  
    onSubmit(): void {
      if (this.addEditProductForm.invalid) return;
  
      const formData = this.addEditProductForm?.value;
      console.log(this.selectedBranches);
      
      if (this.isEditMode && this.productId) {
        this._inventoryService.updateProduct(this.productId, formData).subscribe({
          next: res => console.log('User updated successfully', res),
          error: err => console.error('Error updating user', err)
        });
      } else {
        this._inventoryService.addProduct(formData).subscribe({
          next: res => console.log('User created successfully', res),
          error: err => console.error('Error creating user', err)
        });
      }
    }
  }
