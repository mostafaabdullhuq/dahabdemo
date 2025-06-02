import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { PosService } from '../@services/pos.service';
import { PosSalesService } from '../@services/pos-sales.service';
import { combineLatest, distinctUntilChanged, filter, startWith, Subject, takeUntil } from 'rxjs';
import { PosSharedService } from '../@services/pos-shared.service';
import { PosStatusService } from '../@services/pos-status.service';
import { PosReturnsService } from '../@services/pos-returns.service';
import { PosPurchaseService } from '../@services/pos-purchase.service';
import { PosRepairService } from '../@services/pos-repair.service';
import { MenuItem } from 'primeng/api';

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
  shiftData:any = [];
    menuItem: MenuItem[] = [];
  selectedRowData: any = [];
branchTaxNo:any = 0;
  constructor(private _formBuilder: FormBuilder, private _posSalesService: PosSalesService, private _posService: PosService,
    private _dropdownService: DropdownsService, private _posSharedService: PosSharedService,private _posStatusService:PosStatusService
  ,private _posRepairService:PosRepairService
  ) { }

  ngOnInit(): void {
    const customerID = sessionStorage.getItem('customer')
    this.productForm = this._formBuilder.group({
      customer:[customerID],
      weight: ['', Validators.required],
      amount: ['', Validators.required],
      price: [''],
      purity: [''],
      amount_with_tax: [{ value: 0, disabled: true } ],
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

    if (this.shiftData?.is_active) {
      this._posService.getGoldPrice(this.shiftData?.branch).subscribe(res => {
        this.manualGoldPrice = res?.manual_gold_price;
      });

      this._posService.getBranchTax(this.shiftData?.branch).subscribe(res => {
        this.branchTaxNo = res;
        const taxRate = res?.tax_rate || 0;
        this.productForm.get('tax')?.patchValue(taxRate);

        // 👉 Set up listeners for dynamic changes
        this.listenToAmountOrTaxChange();
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
  this._posStatusService.shiftActive$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isShiftActive = status;
      });
        this.menuItem = [
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          this.removeItem(this.selectedRowData?.id);
        }
      }
    ];
  }
  private listenToAmountOrTaxChange() {
  // Clean up previous subscriptions if necessary

  combineLatest([
    this.productForm.get('amount')!.valueChanges.pipe(startWith(this.productForm.get('amount')?.value || 0)),
    this.productForm.get('tax')!.valueChanges.pipe(startWith(this.productForm.get('tax')?.value || 0))
  ])
  .pipe(takeUntil(this.destroy$))
  .subscribe(([amount, taxRate]) => {
    const numericAmount = +amount || 0;
    const numericTaxRate = +taxRate || 0;
    const amountWithTax = numericAmount + (numericAmount * numericTaxRate / 100);

    this.productForm.get('amount_with_tax')?.patchValue(amountWithTax.toFixed(2), { emitEvent: false });
    
  });
}
      removeItem(id: any) {
    this._posService.deleteProductPos(id).subscribe({
      next: res => {
        this._posRepairService.fetchRepairProducts();
      },
    })
  }
    onRowClick(rowData: any): void {
    this.selectedRowData = rowData;
  }
  isShiftActive:boolean = false;
  getPurchaseOrders() {
     this._posRepairService.repairProducts$.subscribe(products => {
      this.purchaseTableData = products;
      this.updateRepairTotals()
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
totalAmount(): number {
  return this.purchaseTableData.reduce((sum: number, group: { amount: string }) => {
    const amount = parseFloat(group.amount) || 0;
  //  this._posSharedService.setRepairTotalPrice(sum + amount)
  //  console.log(sum + amount );
    return sum + amount;
  }, 0);
}

updateRepairTotals(): void {
  const totalPrice = this.purchaseTableData.reduce((sum: number, group: { amount: string }) => {
    const amount = parseFloat(group.amount) || 0;
    return sum + amount;
  }, 0);

  const totalGrand = this.purchaseTableData.reduce((sum: number, group: { amount: string, tax: string }) => {
    const amount = parseFloat(group.amount) || 0;
    const taxPercent = parseFloat(group.tax) || 0;
    const taxAmount = (amount * taxPercent) / 100;
    this._posSharedService.setRepairTotalTax(taxAmount)
    return sum + amount + taxAmount;
  }, 0);

  // Set the shared service values once
  this._posSharedService.setRepairTotalPrice(totalPrice);
  this._posSharedService.setRepairTotalGrand(totalGrand);
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

  // Append all form fields
  formData.append('weight', formValue.weight);
  formData.append('customer', formValue.customer);
  formData.append('amount', formValue.amount);
   formData.append('price', formValue.amount);
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