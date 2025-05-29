import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { PosService } from '../@services/pos.service';
import { PosSalesService } from '../@services/pos-sales.service';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { PosSharedService } from '../@services/pos-shared.service';
import { PosStatusService } from '../@services/pos-status.service';
import { PosReturnsService } from '../@services/pos-returns.service';
import { PosPurchaseService } from '../@services/pos-purchase.service';
import { PosRepairService } from '../@services/pos-repair.service';

@Component({
  selector: 'app-repair-pos',
  standalone:false,
  templateUrl: './repair-pos.component.html',
  styleUrl: './repair-pos.component.scss'
})
export class RepairPosComponent implements OnInit , OnDestroy{
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
  ,private _posRepairService:PosRepairService
  ) { }

  ngOnInit(): void {
    this.productForm = this._formBuilder.group({
      weight: ['', Validators.required],
      amount: ['', Validators.required],
      price: ['', Validators.required],
      purity: [''],
      description: [''],
      attachment: [''],
      tax: [''],
      add_gram: [''],
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

  this._posRepairService.fetchRepairProducts();
  }
  getPurchaseOrders() {
     this._posRepairService.repairProducts$.subscribe(products => {
      this.purchaseTableData = products;
    });
  }
  calcGoldPriceAccordingToPurity(group: any): number {
    if (
      !this.manualGoldPrice ||
      !group?.purity ||
      !group?.purity_value ||
      !this.selectedCurrency?.currency_decimal_point
    ) {
      return 0;
    }

    const baseValue = (+this.manualGoldPrice / 31.10348) * 0.378;
    let purityFactor = 1;

    switch (group.purity) {
      case 24:
        purityFactor = 1;
        break;
      case 22:
        purityFactor = 0.916;
        break;
      case 21:
        purityFactor = 0.88;
        break;
      case 18:
        purityFactor = 0.75;
        break;
      default:
        purityFactor = 1;
    }

    const goldPrice = baseValue * purityFactor * group.purity_value;

    // Format based on selected currency decimal point
    const decimalPlaces = this.selectedCurrency?.currency_decimal_point;
   // this._posSharedService.setGoldPrice(+goldPrice.toFixed(decimalPlaces));
    return +goldPrice.toFixed(decimalPlaces);
  }

  calcMetalValueAccordingToPurity(group: any) {
    const decimalPlaces = this.selectedCurrency?.currency_decimal_point;
    const metalValue = this.calcGoldPriceAccordingToPurity(group) * group?.weight;
   // this._posSharedService.setMetalValue(+metalValue.toFixed(decimalPlaces));
    return +metalValue.toFixed(decimalPlaces);
  }

  calcTotalPrice(group: any): number {
  const metalValue = this.calcMetalValueAccordingToPurity(group);

  const makingCharge = +group?.retail_making_charge || 0;
  const discountPercentage = +group?.discount || 0;

  // Calculate discount amount
  const discountAmount = (discountPercentage / 100) * makingCharge;

  // Share the discount amount with the service
 // this._posSharedService.setDiscountAmount(discountAmount);

  const discountedMakingCharge = makingCharge - discountAmount;

  const stoneValues = (group?.stones || [])
    .slice(0, 3)
    .reduce((sum: number, stone: any) => sum + (+stone?.retail_value || 0), 0);

  const total = metalValue + discountedMakingCharge + stoneValues;

  const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 2;
  return +total.toFixed(decimalPlaces);
}
onVatChange(vatId: number, group: any): void {
  group.selectedVat = vatId;
  this.calcGrandTotalWithVat()
}
calcTotalPriceWithVat(group: any): number {
  const baseTotal = this.calcTotalPrice(group);
  const vatRate = +this.taxes.find((tax: { id: any; }) => tax.id === group.selectedVat)?.rate || 0;
  const vatAmount = (vatRate / 100) * baseTotal;
const totalVat = this.purchaseTableData.reduce((acc: number, group: any) => {
  const baseTotal = this.calcTotalPrice(group); // your existing method
  const vatRate = +this.taxes.find((tax: { id: any }) => tax.id === group.selectedVat)?.rate || 0;
  const vatAmount = (vatRate / 100) * baseTotal;
  return acc + vatAmount;
}, 0);
  // Update shared VAT immediately
  const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 2;
 // this._posSharedService.setVat(+totalVat.toFixed(decimalPlaces));

  const totalWithVat = baseTotal + vatAmount;
  return +totalWithVat.toFixed(decimalPlaces);
}
calcGrandTotalWithVat(): number {
  if (!this.purchaseTableData || this.purchaseTableData.length === 0) return 0;

  const total = this.purchaseTableData.reduce((sum: number, group: any) => {
    return sum + this.calcTotalPriceWithVat(group);
  }, 0);

  const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 2;
  //  this._posSharedService.setGrandTotalWithVat(+total.toFixed(decimalPlaces));
  
  return +total.toFixed(decimalPlaces);
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
  get totalPrice(): number {
    const total = this.purchaseTableData.reduce((sum: number, group: any) => {
      return sum + this.calcTotalPrice(group);
    }, 0);

    const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 2;
    const formattedTotal = +total.toFixed(decimalPlaces);
    // Update the service with the calculated gold price
    // this._posSharedService.setTotalPrice(formattedTotal);

    return formattedTotal;
  }
onSubmit(): void {
  if (this.productForm.invalid) return;

  const formValue = this.productForm.value;
  const formData = new FormData();

  // Append all form fields
  formData.append('weight', formValue.weight);
  formData.append('amount', formValue.amount);
  formData.append('price', formValue.price);
  formData.append('purity', formValue.purity ?? '');
  formData.append('description', formValue.description ?? '');
  formData.append('tax', formValue.tax ?? '');
  formData.append('add_gram', formValue.add_gram ?? '');

  // Handle file upload
  const file = formValue.attachment;
  if (file instanceof File) {
    formData.append('attachment', file);
  }

  // Submit to the service
  this._posRepairService.addRepairProduct(formData).subscribe({
    next: (res) => {
      this.productForm.reset();
      this.getPurchaseOrders(); // Refresh data
    },
    error: (err) => console.error('Error submitting', err)
  });
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}