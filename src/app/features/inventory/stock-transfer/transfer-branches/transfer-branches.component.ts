import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../@services/inventory.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { filter } from 'rxjs';
import { ToasterMsgService } from '../../../../core/services/toaster-msg.service';

@Component({
  selector: 'app-transfer-branches',
  imports: [SharedModule, RouterLink],
  templateUrl: './transfer-branches.component.html',
  styleUrl: './transfer-branches.component.scss'
})
export class TransferBranchesComponent implements OnInit, OnChanges {
  @Input() isEditMode = false;
  @Input() transferObject: any = null;
  @Input() transferType: "branch" | "stock-point" | null = null;

  addEditTransferForm!: FormGroup;
  branches = [];
  products: any[] = [];
  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];
  transferItems: any[] = [];
  addedProducts: any[] = [];

  constructor(
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
    private _router: Router,
    private _toaster: ToasterMsgService
  ) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEditMode']?.currentValue && changes['transferObject']?.currentValue) {
      this.loadData();
    }
  }

  ngOnInit(): void {
    this.initForm();

    this._dropdownService.getBranches().subscribe(data => {
      this.branches = data?.results;
    });

    this.addEditTransferForm.get('current_branch')?.valueChanges.subscribe(res => {
      this.getProductsByBranch(res);
    });

    this.addEditTransferForm.get('product_id')?.valueChanges
      .pipe(filter(productId => !!productId))
      .subscribe(productId => {
        if (productId) {
          const fromBranch = this.addEditTransferForm.get('current_branch')?.value;
          const toBranch = this.addEditTransferForm.get('transfer_branch')?.value;
          if (fromBranch && toBranch) {
            this.tryAddProduct(productId);
            this.addEditTransferForm?.get('product_id')?.reset();
          }
        }
      });
  }



  addProduct(product: any) {
    const itemExists = this.productsFormArray.controls.find(ctrl => ctrl.value.product_id === product.id);
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
      transfer_branch: ['', Validators.required],
      product_id: [''],
      shipping_charges: ['', Validators.required],
      additional_notes: [''],
      products: this._formBuilder.array([]) // FormArray for products
    });
  }

  get productsFormArray() {
    return this.addEditTransferForm?.get("products") as FormArray
  }

  private loadData(): void {
    this.addEditTransferForm.patchValue({
      current_branch: this.transferObject?.current_branch || null,
      transfer_branch: this.transferObject?.transfer_branch || null,
      product_id: null,
      shipping_charges: this.transferObject?.shipping_charges || null,
      additional_notes: this.transferObject?.additional_notes || null,
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

  getProductsByBranch(branchId: string | number) {
    this._dropdownService.getProducts(true, `branch=${branchId}&page_size=10000000`).subscribe(data => {
      this.products = data?.results;
      this.filterProducts();
    });
  }

  filterProducts() {
    this.products = this.products?.filter((item: any) => !this.addedProducts.includes(item)) || [];
  }

  private tryAddProduct(productId: any): void {
    const fromBranch = this.addEditTransferForm.get('current_branch')?.value;
    const toBranch = this.addEditTransferForm.get('transfer_branch')?.value;

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
        transfer_quantity: [1, Validators.required]
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
      transfer_branch: formValue.transfer_branch,
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
      ? this._inventoryService.updateTransferStock(this.transferObject.id, payload)
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
