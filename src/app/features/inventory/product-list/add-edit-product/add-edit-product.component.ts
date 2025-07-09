import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../@services/inventory.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  stockPoints: any[] = [];
  units: any[] = [];
  designers: any[] = [];
  sizes: any[] = [];
  purities: any[] = [];
  categories: any[] = [];
  brands: any[] = [];
  branches: any[] = [];
  stones: any[] = [];
  colors: any[] = []
  counties: any[] = []
  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];

  constructor(
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
    private _activeRoute: ActivatedRoute,
    private _router: Router
  ) { }

  ngOnInit(): void {
    const productId = this._activeRoute.snapshot.paramMap.get('id');
    if (productId)
      this.productId = productId;
    this.initForm();
    if (this.productId) {
      this.loadProductData(this.productId);
      this.isEditMode = true
    }
    this.addStockItem();
    this.addStone()

    this._dropdownService.getBrands().subscribe(data => {
      this.brands = data?.results;
    });
    this._dropdownService.getColor().subscribe(data => {
      this.colors = data?.results;
    });
    this._dropdownService.getAllCountries().subscribe(data => {
      this.counties = data?.results;
    });
    this._dropdownService.getCategories().subscribe(data => {
      this.categories = data?.results;
    });
    this._dropdownService.getPurities().subscribe(data => {
      this.purities = data?.results;
    });
    this._dropdownService.getBranches().subscribe(data => {
      this.branches = data?.results;
    });
    this._dropdownService.getSizes().subscribe(data => {
      this.sizes = data?.results;
    });
    this._dropdownService.getStones().subscribe(data => {
      this.stones = data?.results;
    });
    this._dropdownService.getDesigners().subscribe(data => {
      this.designers = data?.results;
    });
    this._dropdownService.getUnits().subscribe(data => {
      this.units = data?.results;
    });
    this._dropdownService.getStockPoints().subscribe(data => {
      this.stockPoints = data?.results;
    });
    this._inventoryService.getProductsCustomFields().subscribe(res => {
      this.customFields = res;
      this.addCustomFields();

    });
    this.addEditProductForm.get('purity_id')?.valueChanges.subscribe((id) => {
      const selected = this.purities.find(p => p.id === id);
      this.selectedPurityValue = selected?.purity_value ?? null;
    });
  }
  selectedPurityValue: number | null = null;
  private initForm(): void {
    this.addEditProductForm = this._formBuilder.group({
      //    stock_point: [''],
      is_active: [''],
      discount: [''],
      max_discount: [''],
      price: ['', Validators.required],
      tag_number: [''],
      making_charge: [''],
      color_id: [''],
      country: [''],
      weight: [''],
      designer_id: [''],
      size_id: [''],
      purity_id: ['', Validators.required],
      unit_id: [''],
      brand_id: [''],
      retail_making_charge: [''],
      category_id: ['', Validators.required],
      description: [''],
      name: [''],
      stones: this._formBuilder.array([]), // FormArray for stones
      branches: this._formBuilder.array([]),
      image: [null]
    });
  }
  private loadProductData(productId: number | string): void {
    this._inventoryService.getProductById(productId).subscribe((product: any) => {
      // Patch the main form fields
      this.addEditProductForm.patchValue({
        // stock_point: product.stock_point,
        is_active: product.is_active,
        retail_making_charge: product.retail_making_charge,
        discount: product.discount,
        max_discount: product.max_discount,
        price: product.price,
        tag_number: product.tag_number,
        making_charge: product.making_charge,
        weight: product.weight,
        designer_id: product.designer_id,
        size_id: product.size_id,
        purity_id: product.purity_id,
        unit_id: product.unit_id,
        color_id: product.color,
        brand_id: product.brand_id,
        category_id: product.category_id,
        description: product.description,
        name: product.name,
        country: product.country
        //image: product?.image
      });

      // Clear and add stones if any
      this.stonesArray.clear();
      if (Array.isArray(product.stones)) {
        product.stones.forEach((stone: any) => this.addStone(stone));
      }

      // Clear and add branches if any
      const branchesArray = this.addEditProductForm.get('branches') as FormArray;
      branchesArray.clear();

      if (product.branches?.length) {
        product.branches.forEach((stock: any) => {
          this.addStockItem({
            branch_id: stock.branch_id,
            stock_quantity: stock.stock_quantity,
            stock_point: stock.stock_point,
            is_active: stock.is_active,
          });
        });
        // fetch(product?.image)
        // .then(res => res.blob())
        // .then(blob => {
        //   const file = new File([blob], "image.jpg", { type: blob.type });
        //   this.addEditProductForm.patchValue({ image: file });
        // });
      }

      // Add custom fields dynamically if available
      if (product.custom_fields && Array.isArray(product.custom_fields)) {
        this.customFields = product.custom_fields;
        this.addCustomFields();
        product.custom_fields.forEach((field: { field_name: any; value: any; }) => {
          if (this.addEditProductForm.contains(field.field_name)) {
            this.addEditProductForm.get(field.field_name)?.setValue(field.value || '');
          }
        });
      }
    });
  }
  get stonesArray(): FormArray {
    return this.addEditProductForm.get('stones') as FormArray;
  }

  addStone(stone = { stone_id: null, value: null, weight: null, retail_value: null }): void {
    this.stonesArray.push(
      this._formBuilder.group({
        stone_id: [stone.stone_id],
        value: [stone.value],
        weight: [stone.weight],
        retail_value: [stone.retail_value],
      })
    );
  }

  removeStone(index: number): void {
    this.stonesArray.removeAt(index);
  }

  customFields!: any[];
  // Dynamically add custom fields to the form
  private addCustomFields(): void {
    this.customFields.forEach(field => {
      if (!this.addEditProductForm.contains(field.field_name)) {
        this.addEditProductForm.addControl(field.field_name, new FormControl(''));
      }
    });
  }


  onSubmit(): void {
    if (this.addEditProductForm.invalid) return;

    const formData = new FormData();
    const formValue = this.addEditProductForm.value;

    // Append simple fields
    Object.keys(formValue).forEach(key => {
      if (key === 'image' || key === 'branches' || key === 'stones' || key === 'custom_fields') return; // handle these separately

      // Avoid appending null or undefined values
      if (formValue[key] !== null && formValue[key] !== undefined) {
        formData.append(key, formValue[key]);
      }
    });

    // Append image (assumed to be a File object)
    if (formValue.image) {
      formData.append('image', formValue.image);
    }

    // Append branches as JSON string if it's an array
    if (formValue.branches && Array.isArray(formValue.branches)) {
      formData.append('branches', JSON.stringify(formValue.branches));
    }
    if (formValue.custom_fields && Array.isArray(formValue.custom_fields)) {
      formData.append('custom_fields', JSON.stringify(formValue.custom_fields));
    }
    if (formValue.stones && Array.isArray(formValue.stones)) {
      formData.append('stones', JSON.stringify(formValue.stones));
    }

    // Send as FormData
    const request$ = this.isEditMode && this.productId
      ? this._inventoryService.updateProduct(this.productId, formData)
      : this._inventoryService.addProduct(formData);

    request$.subscribe({
      next: res => this._router.navigate([`inventory/products`]),
      error: err => console.error('Error', err)
    });
  }



  private createStockGroup(data: any = {}): FormGroup {
    return this._formBuilder.group({
      branch_id: [data.branch_id || ''],
      stock_quantity: [data.stock_quantity || 0],
      is_active: [data.is_active || false,],
      stock_point: [data.stock_point || '',],

    });
  }
  get stockInfoArray(): FormArray {
    return this.addEditProductForm.get('branches') as FormArray;
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
