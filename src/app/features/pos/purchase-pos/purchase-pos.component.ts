import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { PosService } from '../@services/pos.service';
import { PosSalesService } from '../@services/pos-sales.service';
import { distinctUntilChanged, filter, Subject, take, takeUntil } from 'rxjs';
import { PosSharedService } from '../@services/pos-shared.service';
import { PosStatusService } from '../@services/pos-status.service';
import { PosReturnsService } from '../@services/pos-returns.service';
import { PosPurchaseService } from '../@services/pos-purchase.service';

@Component({
  selector: 'app-purchase-pos',
  standalone:false,
  templateUrl: './purchase-pos.component.html',
  styleUrl: './purchase-pos.component.scss'
})
export class PurchasePosComponent implements OnInit , OnDestroy{
  purities: any = [];
  receipts: any = [];
  productForm!: FormGroup;
  purchaseTableData: any = [];
  cols: any = [];
  selectedVat: any = ''
  taxes: any = [];
  salesProduct: any = [];
  manualGoldPrice = '';
  selectedCurrency: any = ''
  private destroy$ = new Subject<void>();
  defualtVat = 0;
  shiftData:any = []
  constructor(private _formBuilder: FormBuilder, private _posSalesService: PosSalesService, private _posService: PosService,
    private _dropdownService: DropdownsService, private _posSharedService: PosSharedService,private _posStatusService:PosStatusService
  ,private _posPurchaseService:PosPurchaseService
  ) { }

  ngOnInit(): void {
    this.productForm = this._formBuilder.group({
      weight: ['', Validators.required],
      amount: ['', Validators.required],
      purity: [''],
      attachment: [''],
    })
    
    this._dropdownService.getPurities().subscribe((res) => {
      this.purities = res?.results;
    });
    this.getPurchaseOrders()
    this._posStatusService.shiftData$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.shiftData = data;
      if(this.shiftData && this.shiftData?.is_active){
        this._posService.getGoldPrice(this.shiftData?.branch).subscribe(res => {
          this.manualGoldPrice = res?.manual_gold_price;
        });
      }
    });

    this._posSharedService.selectedCurrency$
      .subscribe(currency => {
        if (currency) {
          this.selectedCurrency = currency;          
        } else {
          this.selectedCurrency = null;
        }
      });

      this.productForm.get('product_id')?.valueChanges
  .pipe(
    takeUntil(this.destroy$),
    distinctUntilChanged(), // prevent firing if same value is set again
    filter(value => !!value) // avoid null/undefined triggers
  )
  .subscribe((productId: number) => {
    this.onProductSelected(productId);
  });
this._posStatusService.shiftActive$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isShiftActive = status;
      });
  }
  isShiftActive:boolean = false;

totalAmount(): number {
  return this.purchaseTableData.reduce((sum: number, group: { amount: string }) => {
    const amount = parseFloat(group.amount) || 0;
    return sum + amount;
  }, 0);
}
private subtractFromTotals(amount: number): void {
  this._posSharedService.purchaseTotalGrand$.pipe(take(1)).subscribe(res => {
    this._posSharedService.setPurchaseTotalGrand(amount);
  });

  this._posSharedService.purchaseTotalPrice$.pipe(take(1)).subscribe(res => {    
    this._posSharedService.setPurchaseTotalPrice(amount);
  });
}

getPurchaseOrders() {
  this._posPurchaseService.purchaseProducts$.subscribe(data => {
    this.purchaseTableData = data;
    this.subtractFromTotals(this.totalAmount());
  });
}
  onProductSelected(productId: number): void {
    const selectedProduct = this.purities.find((p: any) => p.id === productId);
    if (!selectedProduct) return;

    const payload = {
      product: selectedProduct.id,
      amount: selectedProduct.retail_making_charge
    };

    this._posService.addProductSale(payload)
      .subscribe({
        next: res => {
         // this._posSalesService.getSalesOrdersFromServer();
        },
        error: err => {
          console.error('Error posting product', err);
        }
      });
  }

  onSubmit(): void {
  if (this.productForm.invalid) return;

  const formValue = this.productForm.value;
  const formData = new FormData();

  // Convert simple fields
  formData.append('weight', formValue.weight);
  formData.append('amount', formValue.amount);
  formData.append('purity', formValue.purity ?? '');

  // Handle file upload (assuming attachment is a File object)
  const file = formValue.attachment;
  if (file instanceof File) {
    formData.append('attachment', file);
  }

  // Submit the formData to your API
  this._posPurchaseService.addPurchaseProduct(formData).subscribe({
    next: res => {
      this.productForm.reset();
      this.getPurchaseOrders()
      this.productForm.reset()
    }
      ,
    error: err => console.error('Error submitting', err)
  });
}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}