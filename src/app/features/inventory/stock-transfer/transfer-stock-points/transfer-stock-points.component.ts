import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../@services/inventory.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-transfer-stock-points',
  imports: [SharedModule, RouterLink ],
  templateUrl: './transfer-stock-points.component.html',
  styleUrl: './transfer-stock-points.component.scss'
})
export class TransferStockPointsComponent {
    addEditTransferForm!: FormGroup;
    isEditMode = false;
    transId: string | number = '';
    branches =[];
    products :any =[];
    stockPoints :any =[];
    nextPageUrl: string | null = null;
    isLoading = false;
    selectedBranches =[];
    transferItems: any[] = [];
  
    constructor(
      private _inventoryService: InventoryService,
      private _formBuilder: FormBuilder,
      private _activeRoute:ActivatedRoute,
      private _dropdownService:DropdownsService,
    ) {}
  
    ngOnInit(): void {
      const transId = this._activeRoute.snapshot.paramMap.get('id');
    if(transId)
      this.transId = transId;
      this.initForm();
      if (this.transId) {
        this.loadData(this.transId);
        this.isEditMode = true
      }
  
      this._dropdownService.getBranches().subscribe(data => {
        this.branches = data?.results;
      });
      this._dropdownService.getStockPoints().subscribe(data => {
        this.stockPoints = data?.results;
      });
      this._dropdownService.getProducts().subscribe(data => {
        this.products = data?.results;
      });
      this.addEditTransferForm.get('product_id')?.valueChanges.subscribe(productId => {
        const fromBranch = this.addEditTransferForm.get('current_branch')?.value;
        const toBranch = this.addEditTransferForm.get('stock_point_id')?.value;
    
        if (fromBranch && toBranch && productId) {
          const product = this.products?.find((p:any) => p.id === productId);
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
      this.addEditTransferForm.get('product_id')?.valueChanges
      .pipe(filter(productId => !!productId))
      .subscribe(productId => {
        this.tryAddProduct(productId);
      });
    }
    addProduct(product: any) {
      const itemExists = this.productsControls.controls.find((ctrl: { value: { product_id: any; }; }) => ctrl.value.product_id === product.id);
      if (!itemExists) {
        const group = this._formBuilder.group({
          product_id: [product.id],
          name: [product.name],
          price: [product.price],
          unit: [product.unit],
          transfer_quantity: [1, Validators.required]
        });
        this.productsControls.push(group);
      }
    }
    removeItem(index: number) {
      this.productsControls.removeAt(index);
    }
    get totalPrice(): number {
      return this.transferItems.reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.transfer_quantity || 0;
        return total + price * quantity;
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
    get productsControls(): FormArray {
      return this.addEditTransferForm.get('products') as FormArray;
    }
    private loadData(transfer: number | string): void {
      this._inventoryService.getTransferBranchById(transfer).subscribe((trans:any) => {
        this.addEditTransferForm.patchValue({
          current_branch: trans,
          stock_point_id: trans,
          product_id: trans, // temporary for selection
          shipping_charges:trans,
          additional_notes:trans ,
        });
      });
    }
    private tryAddProduct(productId: any): void {
      const fromBranch = this.addEditTransferForm.get('current_branch')?.value;
      const toBranch = this.addEditTransferForm.get('stock_point_id')?.value;
    
      if (!fromBranch || !toBranch || !productId) {
        return;
      }
    
      const product = this.products?.find((p: any) => p.id === productId);
    
      // Check if product is already added
      const alreadyAdded = this.productsControls.controls.some(ctrl => ctrl.get('id')?.value === productId);
      if (product && !alreadyAdded) {
        this.productsControls.push(this._formBuilder.group({
          id: [product.id],
          name: [product.name],
          unit: [product.unit],
          price: [product.price],
          transfer_quantity: [1]
        }));
      }
    }
    onSubmit(): void {    
      const formValue = this.addEditTransferForm.value;
    
      const payload: any = {
        current_branch: formValue.current_branch,
        stock_point_id: formValue.stock_point_id,
        shipping_charges: formValue.shipping_charges,
        additional_notes: formValue.additional_notes,
        products: this.productsControls.value.map((item: any) => ({
          transfer_quantity: item.transfer_quantity,
          product_id: item.id
        }))
      };
      if (!payload) {
        this.addEditTransferForm.markAllAsTouched();
        return;
      }
    
    
      const request$ = this.isEditMode && this.transId
        ? this._inventoryService.updateTransferBranch(this.transId, payload)
        : this._inventoryService.addTransferBranch(payload);
    
      request$.subscribe({
        next: res => {
          console.log(`Transfer ${this.isEditMode ? 'updated' : 'created'} successfully`, res);
          this.addEditTransferForm.reset();
          this.productsControls.clear(); // also reset products
        },
        error: err => {
          console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} transfer`, err);
        }
      });
    }
  }
