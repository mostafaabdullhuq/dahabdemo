import { Component, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { PosService } from '../@services/pos.service';
import { PosSalesService } from '../@services/pos-sales.service';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { PosSharedService } from '../@services/pos-shared.service';
import { PosStatusService } from '../@services/pos-status.service';
import { MenuItem } from 'primeng/api';
import { SetDiscountComponent } from './set-discount/set-discount.component';
import { Currency, Tax } from '../interfaces/pos.interfaces';
import Decimal from 'decimal.js';
import { ToasterMsgService } from '../../../core/services/toaster-msg.service';

@Component({
  selector: 'app-sales-pos',
  standalone: false,
  templateUrl: './sales-pos.component.html',
  styleUrl: './sales-pos.component.scss'
})
export class SalesPosComponent implements OnInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  private destroy$ = new Subject<void>();

  products: any = [];
  productForm!: FormGroup;
  salesDataOrders: any = [];
  cols: any = [];
  selectedVat: any = ''
  taxes: Tax[] = [];
  salesProduct: any = [];
  menuItem: MenuItem[] = [];
  manualGoldPrice = '';
  selectedCurrency: Currency | null = null
  defualtVat = 0;
  shiftData: any = [];
  isSelectedCustomerAndCurrency: boolean = true;
  defaultBranchVatId: any = null;
  isShiftActive: boolean = false;
  selectedRowData: any = [];
  componentRef!: ComponentRef<SetDiscountComponent>;

  constructor(
    private _formBuilder: FormBuilder,
    private _posSalesService: PosSalesService,
    private _posService: PosService,
    private _dropdownService: DropdownsService,
    private _posSharedService: PosSharedService,
    private _posStatusService: PosStatusService,
    private _toaster: ToasterMsgService
  ) { }

  ngOnInit(): void {
    this.productForm = this._formBuilder.group({
      product_id: ['', Validators.required]
    })

    this._dropdownService.getTaxes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.taxes = res?.results || [];
        if (this.taxes.length) this.defaultBranchVatId = this.taxes[0]?.id;
      });

    this._posStatusService.shiftData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.shiftData = data;
        if (this.shiftData && this.shiftData?.is_active) {
          this.getProductList()

          this._posService.getGoldPrice(this.shiftData?.branch).subscribe(res => {
            this.manualGoldPrice = res?.manual_gold_price;

            this._posSharedService.selectedCurrency$
              .pipe(takeUntil(this.destroy$))
              .subscribe(currency => {
                this.selectedCurrency = currency;
                this.getSalesOrder()
              });
          });
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
        if (!status) this.selectedCurrency = null;
      });

    this.menuItem = [
      {
        label: 'Set Discount',
        icon: 'pi pi-percentage',
        command: () => this.setDiscount()
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.removeItem(this.selectedRowData?.id)
      }
    ];

    this._posStatusService.shiftActive$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isShiftActive = status;
      });

    this._posSharedService.orderPlaced$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getProductList();
      });
  }

  setDiscount() {
    if (!this.selectedRowData?.id || !this.selectedRowData?.amount) return;

    this.container.clear();
    this.componentRef = this.container.createComponent(SetDiscountComponent);
    this.componentRef.instance.selectedRow = this.selectedRowData;
    this.componentRef.instance.showDialog();
    this.componentRef.instance.parentTab = "sales"
  }

  onRowClick(rowData: any): void {
    this.selectedRowData = rowData;
  }

  getSalesOrder() {
    this._posSalesService._salesReciepts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.salesDataOrders = res;

        if (this.salesDataOrders.length === 0) {
          this._posSharedService.setSalesTax(0);
          this._posSharedService.setSalesTotalGrand(0);
          this._posSharedService.setSalesTotalPrice(0);
          this._posSharedService.setSalesDiscountAmount(0);
        }

        this.productForm.get('product_id')?.patchValue(null)
      });

    // initial load
    this._posSalesService.getSalesOrdersFromServer();
  }

  getProductList() {
    this._posService.getProductSalesList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.products = res?.results.map((product: { name: any; tag_number: any; }) => ({
          ...product,
          displayLabel: ` ${product.tag_number} | ${product.name}`
        }));
      });
  }

  removeItem(id: any) {
    this._posService.deleteProductPos(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => this._posSalesService.getSalesOrdersFromServer(),
        error: () => { },
        complete: () => this.getProductList()
      });
  }

  onGoldPriceChange(order: any) {
    const newPrice = order.gold_price

    if (!newPrice || isNaN(newPrice)) return;

    const updatedPrices = {
      gold_price: newPrice
    }

    this._posService.updateOrderValues(order.id, updatedPrices)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => this.updateOrderFromResponse(order, res));
  }

  storeLastValidAmount(order: any) {
    order._lastValidAmount = order.amount;
  }

  storeLastValidMakingCharge(order: any) {
    order._lastValidMakingCharge = order.retail_making_charge;
  }

  onTotalPriceChange(order: any) {
    const newTotalPrice = order.amount;

    if (!newTotalPrice || isNaN(newTotalPrice)) {
      order.amount = order._lastValidAmount;
      this._toaster.showError("Invalid price value");
      return;
    }

    const updatedPrices = {
      amount: +newTotalPrice
    }

    this._posService.updateOrderValues(order.id, updatedPrices)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.updateOrderFromResponse(order, res);
          order._lastValidAmount = order.amount;
        },
        error: (err) => {
          order.amount = order._lastValidAmount;
          this._toaster.showError(err?.error?.errors?.amount || "Failed  to update product price");
        }
      });
  }

  onRetailMakingChargeChange(order: any) {
    const newRetailMakingCharge = order.retail_making_charge;

    if (!newRetailMakingCharge || isNaN(newRetailMakingCharge) || newRetailMakingCharge < 0) {
      order.retail_making_charge = order._lastValidMakingCharge;
      this._toaster.showError("Invalid making charge value");
      return;
    }

    const diff = order._lastValidMakingCharge - order.retail_making_charge;
    const newTotalPrice = order.amount - diff;

    // Update the order object
    order.amount = +newTotalPrice.toFixed(this.defaultDecimalPlaces);

    const updatedPrices = {
      making_charge: +newRetailMakingCharge,
    }

    this._posService.updateOrderValues(order.id, updatedPrices)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.updateOrderFromResponse(order, res);
          order._lastValidMakingCharge = order.retail_making_charge;
        },
        error: () => {
          order.retail_making_charge = order._lastValidMakingCharge;
          this._toaster.showError("Failed to update making charge");
        }
      });
  }

  onVatChange(vatId: number, group: any): void {
    group.selectedVat = vatId;

    // Track if it's the first or second+ selection
    if (!group._vatSelectedOnce) {
      group._vatSelectedOnce = true; // first time, don't send
      return;
    }

    // second time or more, send to backend
    const orderId = group?.id;
    const updatedData = {
      vat: vatId
    }

    this._posService.updateOrderValues(orderId, updatedData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.updateOrderFromResponse(group, result);
      });
  }

  onProductSelected(productId: number): void {
    const selectedProduct = this.products.find((p: any) => p.id === productId);

    if (!selectedProduct) return;

    const payload = {
      product: selectedProduct.id,
      vat: this.defaultBranchVatId,
    };

    this._posService.addProductSale(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => this._posSalesService.getSalesOrdersFromServer(),
        error: err => this._toaster.showError("Cannot add sales product"),
        complete: () => this.getProductList()
      });
  }

  get totalPrice(): string {
    const total = this.salesDataOrders?.reduce((sum: Decimal, group: any) => {
      return sum.plus((group.amount || 0.000));
    }, new Decimal(0.000)) || new Decimal(0);

    // Truncate (not round) to 3 decimals, then format as string with 3 decimals
    const truncated = total.toDecimalPlaces(this.defaultDecimalPlaces, Decimal.ROUND_DOWN);
    const formattedTotal = truncated.toFixed(this.defaultDecimalPlaces);
    return formattedTotal;
  }

  get totalVat(): number {
    return this.salesDataOrders?.reduce((acc: number, group: any) => {
      return acc + (+(group?.vat_amount ?? 0));
    }, 0) || 0;
  }

  get grandTotalWithVat(): number {
    return (+this.totalPrice || 0) + (+this.totalVat || 0);
  }

  get totalDiscount(): number {
    return this.salesDataOrders?.reduce((acc: number, group: any) => {
      return acc + (+group?.amount * (+group?.discount / 100.000));
    }, 0) || 0;
  }

  updateSharedTotals() {
    this._posSharedService.setSalesTotalPrice(+(+this.totalPrice).toFixed(this.defaultDecimalPlaces));
    this._posSharedService.setSalesTax(+this.totalVat.toFixed(this.defaultDecimalPlaces));
    this._posSharedService.setSalesTotalGrand(+this.grandTotalWithVat.toFixed(this.defaultDecimalPlaces));
    this._posSharedService.setSalesDiscountAmount(+this.totalDiscount.toFixed(this.defaultDecimalPlaces));
  }

  get decimalPlaces() {
    return +(this.selectedCurrency?.currency_decimal_point ?? 3)
  }

  get defaultDecimalPlaces() {
    return 3;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Helper function to update order from response
  updateOrderFromResponse(order: any, res: any) {
    if (!res) return;

    if ('amount' in res) order.amount = +res.amount;
    if ('vat_amount' in res) order.vat_amount = +res.vat_amount;
    if ('metal_value' in res) order.metal_value = +res.metal_value;
    if ('gold_price' in res) order.gold_price = +res.gold_price;
    if ('making_charge' in res) order.retail_making_charge = +res.making_charge;
    if ('discount' in res) order.discount = +res.discount;
    if ('max_discount' in res) order.max_discount = +res.max_discount;
    if ('vat' in res) order.vat = +res.vat;

    this.updateSharedTotals();
  }
}
