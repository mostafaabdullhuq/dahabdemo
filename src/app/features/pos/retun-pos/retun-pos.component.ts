import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { PosService } from '../@services/pos.service';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { PosSharedService } from '../@services/pos-shared.service';
import { PosStatusService } from '../@services/pos-status.service';
import { PosReturnsService } from '../@services/pos-returns.service';
import { MenuItem } from 'primeng/api';
import { Currency, Customer, Tax } from '../interfaces/pos.interfaces';

@Component({
  selector: 'app-retun-pos',
  standalone: false,
  templateUrl: './retun-pos.component.html',
  styleUrl: './retun-pos.component.scss'
})
export class RetunPosComponent implements OnInit, OnDestroy {
  products: any = [];
  receipts: any = [];
  productForm!: FormGroup;
  returnDataOrders: any = [];
  cols: any = [];
  selectedVat: any = ''
  taxes: Tax[] = [];
  salesProduct: any = [];
  manualGoldPrice = '';
  selectedCurrency: Currency | null = null;
  selectedCustomer: Customer | null = null;
  private destroy$ = new Subject<void>();
  defualtVat = 0;
  shiftData: any = [];
  menuItem: MenuItem[] = [];

  constructor(private _formBuilder: FormBuilder, private _posReturnService: PosReturnsService, private _posService: PosService,
    private _dropdownService: DropdownsService, private _posSharedService: PosSharedService, private _posStatusService: PosStatusService
  ) { }

  ngOnInit(): void {
    this.productForm = this._formBuilder.group({
      product_id: ['', Validators.required],
      reciept_id: ['', Validators.required],
    })

    let customer = sessionStorage?.getItem('customer');
    let params = ""
    if (customer) {
      params = `customer_id=${customer}`
    }

    this._posReturnService.getReturnReciepts(params).subscribe((res) => {
      this.receipts = res?.results;
    });

    this._posReturnService.receipts$.subscribe(receipts => {
      this.receipts = receipts;
    });

    this.productForm.get('reciept_id')?.valueChanges.subscribe(res => {
      if (res) {
        const params = `orderproduct__order_id=${res}
        &orderproduct__order__customer_id=${sessionStorage.getItem('customer')}`
        this._posReturnService.getReturnProducts(params).subscribe((res) => {
          this.products = res?.results;
        });
      }
    })

    this._dropdownService.getTaxes().subscribe((res) => {
      this.taxes = res?.results || [];
    });

    this.getReturnsOrder()

    this._posStatusService.shiftData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.shiftData = data;

        if (this.shiftData && this.shiftData?.is_active) {
          this._posService.getGoldPrice(this.shiftData?.branch).subscribe(res => {
            this.manualGoldPrice = res?.manual_gold_price;
          });
        }
      });

    this._posSharedService.selectedCurrency$
      .pipe(takeUntil(this.destroy$))
      .subscribe(currency => {
        this.selectedCurrency = currency;
      });

    this._posSharedService.selectedCustomer$
      .pipe(takeUntil(this.destroy$))
      .subscribe(customer => {
        this.selectedCustomer = customer;
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

    this._posReturnService.returnOrders$.subscribe(data => {
      this.returnDataOrders = data;
      const totalVatAmount = data.reduce((acc, item) => acc + (+item.vat_amount || 0), 0);
      this._posSharedService.setReturnTotalTax(totalVatAmount)
    });

    // If needed, manually trigger a refresh
    this._posReturnService.fetchReturnOrders();
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
          this.removeItem(this.selectedRowData);
        }
      }
    ];

    this._posSharedService.returnORrderPlaced$.subscribe(() => {
      this.getReturnsOrder();
    });

  }
  removeItem(item: any) {
    if (!item.id || !item.sold_orderproduct_id) {
      return;
    }

    this._posService.deleteReturnProductPos(+item.id, +item.sold_orderproduct_id).subscribe({
      next: res => {
        this._posReturnService.fetchReturnOrders();
      },
      error: () => { },
      complete: () => { this.getProductList() }
    })
  }

  getProductList() {
    let params = '';
    if (this.productForm.get('reciept_id')?.value) {
      params += `orderproduct__order_id=${this.productForm.get('reciept_id')?.value}&`
    }

    params += `orderproduct__order__customer_id=${sessionStorage.getItem('customer')}`

    this._posReturnService.getReturnProducts(params).subscribe((res) => {
      this.products = res?.results;
    });
  }

  isShiftActive: boolean = false;
  getReturnsOrder() {
    this._posReturnService.fetchReturnOrders();

  }
  refetchReceiptsProducts(selectedCustomer: any) {
    const params = `customer_id=${sessionStorage?.getItem('customer')}`
    this._posReturnService.getReturnReciepts(params).subscribe((res) => {
      this.receipts = res?.results;
    });
    this.productForm.get('reciept_id')?.valueChanges.subscribe(res => {
      if (res) {
        const params = `orderproduct__order_id=${res}
        &orderproduct__order__customer_id=${sessionStorage.getItem('customer')}`
        this._posReturnService.getReturnProducts(params).subscribe((res) => {
          this.products = res?.results;
        });
      }
    })
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

    const baseValue = +this.manualGoldPrice;
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
    const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 2;
    this._posSharedService.setGoldPrice(+goldPrice.toFixed(decimalPlaces));
    return +goldPrice.toFixed(decimalPlaces);
  }

  calcMetalValueAccordingToPurity(group: any) {
    const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 2;
    const metalValue = this.calcGoldPriceAccordingToPurity(group) * group?.weight;
    this._posSharedService.setMetalValue(+metalValue.toFixed(decimalPlaces));
    return +metalValue.toFixed(decimalPlaces);
  }

  calcTotalPrice(group: any): number {
    const metalValue = this.calcMetalValueAccordingToPurity(group);

    const makingCharge = +group?.retail_making_charge || 0;
    const discountPercentage = +group?.discount || 0;

    // Calculate discount amount
    const discountAmount = (discountPercentage / 100) * makingCharge;

    // Share the discount amount with the service
    this._posSharedService.setDiscountAmount(discountAmount);

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
    const selectedTax = this.taxes.find((tax: { id: any; }) => tax.id === group.selectedVat);
    const vatRate = selectedTax?.rate ? +selectedTax.rate : 0;
    const vatAmount = (vatRate / 100) * baseTotal;
    const totalVat = this.returnDataOrders.reduce((acc: number, group: any) => {
      const baseTotal = +this.calcTotalPrice(group); // your existing method
      const selectedTax = this.taxes.find((tax: { id: any }) => tax.id === group.selectedVat);
      const vatRate = selectedTax?.rate ? +selectedTax.rate : 0;
      const vatAmount = (vatRate / 100) * baseTotal;
      return acc + vatAmount;
    }, 0);

    // Update shared VAT immediately
    const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 2;
    //this._posSharedService.setVat(+totalVat.toFixed(decimalPlaces));

    const totalWithVat = baseTotal + vatAmount;
    return +totalWithVat.toFixed(decimalPlaces);
  }

  calcGrandTotalWithVat(): number {
    if (!this.returnDataOrders || this.returnDataOrders.length === 0) return 0;

    const total = this.returnDataOrders.reduce((sum: number, group: any) => {
      return sum + this.calcTotalPriceWithVat(group);
    }, 0);

    const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 2;
    this._posSharedService.setReturnTotalGrand(+total.toFixed(decimalPlaces));

    return +total.toFixed(decimalPlaces);
  }
  onProductSelected(productId: number): void {
    const selectedProduct = this.products.find((p: any) => p.id === productId);
    if (!selectedProduct) return;

    const payload = {
      orderproduct_id: selectedProduct.sold_orderproduct_id,
      // amount: selectedProduct.retail_making_charge
    };

    this._posReturnService.addProductReturn(payload)
      .subscribe({
        next: res => {
          this._posReturnService.fetchReturnOrders();
          this.productForm.get('product_id')?.patchValue(null)
        },
        error: err => {
          console.error('Error posting product', err);
        },
        complete: () => { this.getProductList() }
      });
  }
  // get totalPrice(): number {
  //   const total = this.returnDataOrders?.reduce((sum: any, group: { amount: any; }) => sum + (group.amount || 0), 0) || 0;
  // //  const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 3;
  //   // const formattedTotal = +total.toFixed(decimalPlaces);

  //   this._posSharedService.setReturnTotalGrand(total)
  //   this._posSharedService.setReturnTotalPrice(total)
  //   return total
  // }
  get totalPrice(): number {
    const totalWithoutVat = this.returnDataOrders?.reduce(
      (sum: any, item: { amount: any; }) => sum + (+item.amount || 0),
      0
    ) || 0;

    const totalWithVat = this.returnDataOrders?.reduce(
      (sum: number, item: { amount: number; vat_amount: number; }) => {
        const amount = +item.amount || 0;
        const vat = +item.vat_amount || 0;
        return sum + (amount + vat);
      },
      0
    ) || 0;

    //  const decimalPlaces:number = this.selectedCurrency?.currency_decimal_point ?? 3;
    // Set grand total (includes VAT)
    this._posSharedService.setReturnTotalGrand(+totalWithVat);

    // Set net total (excludes VAT)
    this._posSharedService.setReturnTotalPrice(+totalWithoutVat);

    return totalWithoutVat;
  }
  selectedRowData: any = [];
  onRowClick(rowData: any): void {
    this.selectedRowData = rowData;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  // removeItem(id: any) {
  //   this._posService.deleteProductSale(id).subscribe({
  //     next: res => {
  //       this._posSalesService.getSalesOrdersFromServer();
  //     },
  //   })
  // }
}
