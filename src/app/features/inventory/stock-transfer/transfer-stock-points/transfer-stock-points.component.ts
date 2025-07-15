import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../@services/inventory.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { filter } from 'rxjs';
import { ToasterMsgService } from '../../../../core/services/toaster-msg.service';

@Component({
  selector: 'app-transfer-stock-points',
  imports: [SharedModule, RouterLink],
  templateUrl: './transfer-stock-points.component.html',
  styleUrl: './transfer-stock-points.component.scss'
})
export class TransferStockPointsComponent implements OnInit, OnChanges {
  @Input() isEditMode = false;
  @Input() transferObject: any = null;
  @Input() transferType: "branch" | "stock-point" | null = null;

  addEditTransferForm!: FormGroup;
  transId: string | number = '';
  branches = [];
  products: any = [];
  stockPoints: any = [];
  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];
  transferItems: any[] = [];
  addedProducts: any[] = [];

  constructor(
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
    private _toaster: ToasterMsgService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();

    this._dropdownService.getBranches().subscribe(data => {
      this.branches = data?.results;
    });

    this._dropdownService.getStockPoints().subscribe(data => {
      this.stockPoints = data?.results;
    });

    this.addEditTransferForm.get('product_id')?.valueChanges.subscribe(productId => {
      const fromBranch = this.addEditTransferForm.get('current_branch')?.value;
      const toBranch = this.addEditTransferForm.get('stock_point_id')?.value;

      if (fromBranch && toBranch && productId) {
        const product = this.products?.find((p: any) => p.id === productId);
        if (product && !this.transferItems.find(item => item.id === productId)) {
          this.transferItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            transfer_quantity: 1
          });
          this.addEditTransferForm?.get('product_id')?.reset();
        }
      }
    });

    this.addEditTransferForm.get('current_branch')?.valueChanges.subscribe(branchId => {
      this.getProductsByBranch(branchId);
    });

    this.addEditTransferForm.get('product_id')?.valueChanges
      .pipe(filter(productId => !!productId))
      .subscribe(productId => {
        this.tryAddProduct(productId);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEditMode']?.currentValue && changes['transferObject']?.currentValue) {
      this.loadData();
    }
  }


  getProductsByBranch(branchId: string | number) {
    this._dropdownService.getProducts(true, `branch=${branchId}`).subscribe(data => {
      this.products = data?.results;
      this.filterProducts();
    });
  }

  filterProducts() {
    this.products = this.products?.filter((item: any) => !this.addedProducts.includes(item)) || [];
  }

  addProduct(product: any) {
    const itemExists = this.productsFormArray.controls.find((ctrl: { value: { product_id: any; }; }) => ctrl.value.product_id === product.id);
    if (!itemExists) {
      const group = this._formBuilder.group({
        product_id: [product.id],
        name: [product.name],
        price: [product.price],
        unit: [product.unit],
        transfer_quantity: [1, Validators.required]
      });
      this.productsFormArray.push(group);
    }
  }

  removeItem(index: number) {
    let productId = this.productsFormArray?.controls?.at(index)?.value.id;

    let product = this.addedProducts.find(product => product.id === productId)
    if (product) {
      this.addedProducts = this.addedProducts.filter(product => product !== product);
      this.products.unshift(product);
    }

    this.productsFormArray.removeAt(index);

    this.addEditTransferForm?.get('product_id')?.reset();
  }

  get totalPrice(): number {
    return this.productsFormArray.controls.reduce((total, item) => {
      const price = item?.value?.price || 0;
      const quantity = item?.value?.transfer_quantity || 0;
      return total + (price * quantity);
    }, 0);
  }

  private initForm(): void {
    this.addEditTransferForm = this._formBuilder.group({
      current_branch: ['', Validators.required],
      stock_point_id: ['', Validators.required],
      product_id: [''],
      shipping_charges: ['', Validators.required],
      additional_notes: [''],
      products: this._formBuilder.array([]) // FormArray for products
    });
  }

  get productsFormArray(): FormArray {
    return this.addEditTransferForm.get('products') as FormArray;
  }

  private loadData(): void {
    console.log("data: ", this.transferObject);

    this.addEditTransferForm.patchValue({
      current_branch: this.transferObject.current_branch,
      stock_point_id: this.transferObject.stock_point,
      product_id: null,
      shipping_charges: this.transferObject.shipping_charges,
      additional_notes: this.transferObject.additional_notes,
    });

    this.transferObject.products.forEach((product: any) => {
      this.productsFormArray.push(this._formBuilder.group({
        id: [product.product || '-'],
        name: [product.product_name || '-'],
        unit: [product.unit || '-'],
        price: [product.price || '-'],
        branch_total_weight: [product.branch_total_weight || '-'],
        transfer_quantity: { value: product.transfer_quantity || '-', disabled: true }
      }));
    })
  }

  private tryAddProduct(productId: any): void {
    const fromBranch = this.addEditTransferForm.get('current_branch')?.value;
    const toBranch = this.addEditTransferForm.get('stock_point_id')?.value;

    if (!fromBranch || !toBranch || !productId) {
      return;
    }

    const product = this.products?.find((p: any) => p.id === productId);

    // Check if product is already added
    const alreadyAdded = this.productsFormArray.controls.some(ctrl => ctrl.get('id')?.value === productId);

    if (product && !alreadyAdded) {
      this.addedProducts.push(product);
      this.filterProducts();

      this.productsFormArray.push(this._formBuilder.group({
        id: [product.id],
        name: [product.name],
        unit: [product.unit],
        price: [product.price],
        branch_total_weight: [product.branch_total_weight || '-'],
        transfer_quantity: [1]
      }));
    }

    this.addEditTransferForm?.get('product_id')?.reset();
  }

  onSubmit(): void {
    const formValue = this.addEditTransferForm.value;

    const payload: any = this.isEditMode && this.transferObject?.id ? {
      additional_notes: formValue.additional_notes,
      shipping_charges: formValue.shipping_charges
    } : {
      current_branch: formValue.current_branch,
      stock_point_id: formValue.stock_point_id,
      shipping_charges: formValue.shipping_charges,
      additional_notes: formValue.additional_notes,
      products: this.productsFormArray.value.map((item: any) => ({
        transfer_quantity: item.transfer_quantity,
        product_id: item.id
      }))
    };

    if (!payload) {
      this.addEditTransferForm.markAllAsTouched();
      return;
    }

    const request$ = this.isEditMode && this.transferObject?.id
      ? this._inventoryService.updateTransferStock(this.transferObject?.id, payload)
      : this._inventoryService.addTransferBranch(payload);

    request$.subscribe({
      next: res => {
        this._router.navigate(["inventory/stock-transfer-list"])
      },
      error: err => {
        this._toaster.showError(err)
      }
    });
  }
}
