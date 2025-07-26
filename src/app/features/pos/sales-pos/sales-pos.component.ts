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
  selectedVatId: any = null;
  priceOfProductToPatch: any = 0;
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

    this.getProductList();

    this._dropdownService.getTaxes().subscribe((res) => {
      this.taxes = res?.results || [];
      this.selectedVatId = this.taxes[0]?.id; // Set first VAT as default
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
        if (!status) {
          this.selectedCurrency = null;
        }
      });

    this.menuItem = [
      {
        label: 'Set Discount',
        icon: 'pi pi-percentage',
        command: () => {
          this.setDiscount();
        }
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          this.removeItem(this.selectedRowData?.id);
        }
      }
    ];

    this._posStatusService.shiftActive$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isShiftActive = status;
      });

    this._posSharedService.orderPlaced$.subscribe(() => {
      this.getProductList();
    });
  }

  setDiscount() {
    if (!this.selectedRowData?.id || !this.selectedRowData?.amount) return;

    this.container.clear();
    this.componentRef = this.container.createComponent(SetDiscountComponent);
    this.componentRef.instance.selectedRow = this.selectedRowData;
    this.componentRef.instance.visible = true;
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
        this.salesDataOrders = this.salesDataOrders.map((order: any) => {
          // if the default manual gold price value, calculate it based on purity, otherwise it's already calculated before
          if ((+order.gold_price)?.toFixed(this.defaultDecimalPlaces) === (+this.manualGoldPrice)?.toFixed(this.defaultDecimalPlaces)) {
            order.gold_price = this.calculateOrderGoldPriceBasedOnPurity(order);
            this.onGoldPriceChange(order)
          }

          return order;
        });

        if (this.salesDataOrders.length === 0) {
          this._posSharedService.setSalesTax(0);
          this._posSharedService.setSalesTotalGrand(0);
          this._posSharedService.setSalesTotalPrice(0);
          this._posSharedService.setDiscountAmount(0);
        }

        this.productForm.get('product_id')?.patchValue(null)
      });

    // initial load
    this._posSalesService.getSalesOrdersFromServer();
  }

  getProductList() {
    this._posService.getProductSalesList().subscribe((res) => {
      this.products = res?.results.map((product: { name: any; tag_number: any; }) => ({
        ...product,
        displayLabel: ` ${product.tag_number} | ${product.name}`
      }));
    });
  }

  removeItem(id: any) {
    this._posService.deleteProductPos(id).subscribe({
      next: res => {
        this._posSalesService.getSalesOrdersFromServer();
      },
      error: () => { },
      complete: () => {
        this.getProductList();
      }
    })
  }

  calculateInitialGoldPriceBasedOnPurity(group: any): number {
    if (
      !this.manualGoldPrice ||
      !(group?.purity || group?.purity_value) ||
      !group?.purity_value ||
      !this.selectedCurrency?.currency_decimal_point
    ) {
      return 0;
    }

    const baseValue = (+this.manualGoldPrice);

    let purityFactor;

    if (group.purity_value) {
      purityFactor = +group.purity_value;
    } else {
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
    }

    const goldPrice = baseValue * purityFactor;

    this._posSharedService.setGoldPrice(+goldPrice.toFixed(this.defaultDecimalPlaces));
    return +goldPrice.toFixed(this.defaultDecimalPlaces);
  }

  onGoldPriceChange(order: any) {
    const newPrice = order.gold_price

    if (!newPrice || isNaN(newPrice)) return;

    this.calcGrandTotalWithVat();

    const metalValue = this.calcMetalValueAccordingToPurity(order);
    const totalValue = this.calcTotalPrice(order);
    const vatAmount = this.calculateVat(totalValue, order.selectedVatId ?? this.selectedVatId);

    const updatedPrices = {
      gold_price: newPrice,
      metal_value: metalValue,
      amount: totalValue,
      vat_id: order.selectedVatId ?? this.selectedVatId
    }

    this._posService.updateOrderValues(order.id, updatedPrices).subscribe(res => {
      updateOrderFromResponse(order, res);
    });
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

    // Calculate the fixed components (metal value and stone values)
    const metalValue = this.calcMetalValueAccordingToPurity(order);
    const stoneValues = (order?.stones || [])
      .slice(0, 3)
      .reduce((sum: number, stone: any) => sum + (+stone?.retail_value || 0), 0);

    // Calculate what the new making charge should be
    const newMakingChargeWithDiscount = newTotalPrice - metalValue - stoneValues;

    // Get the current discount percentage
    const discountPercentage = +order?.discount || 0;

    // Calculate the new retail making charge (before discount)
    // If discountedMakingCharge = makingCharge * (1 - discount/100)
    // Then makingCharge = discountedMakingCharge / (1 - discount/100)
    const discountFactor = 1 - (discountPercentage / 100);
    const newRetailMakingCharge = discountFactor > 0 ? newMakingChargeWithDiscount / discountFactor : newMakingChargeWithDiscount;

    if (newRetailMakingCharge < 0) {
      order.amount = order._lastValidAmount;
      this._toaster.showError("Product price difference cannot exceed the product retail price")
      return;
    }

    // Update the order object
    order.retail_making_charge = +newRetailMakingCharge.toFixed(this.defaultDecimalPlaces);

    // Recalculate discount amount based on new making charge
    const newDiscountAmount = (discountPercentage / 100) * newRetailMakingCharge;

    // Update shared service with new discount amount
    this._posSharedService.setDiscountAmount(newDiscountAmount);

    // Recalculate grand total with VAT
    this.calcGrandTotalWithVat();

    // Calculate VAT based on new total price
    const vatAmount = this.calculateVat(newTotalPrice, order.selectedVatId ?? this.selectedVatId);

    const updatedPrices = {
      amount: +newTotalPrice,
      vat_id: order.selectedVatId ?? this.selectedVatId,
    }

    this._posService.updateOrderValues(order.id, updatedPrices).subscribe({
      next: res => {
        updateOrderFromResponse(order, res);
        order._lastValidAmount = order.amount;
      },
      error: () => {
        order.amount = order._lastValidAmount;
        this._toaster.showError("Failed to update price");
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

    // Calculate the fixed components (metal value and stone values)
    const metalValue = this.calcMetalValueAccordingToPurity(order);
    const stoneValues = (order?.stones || [])
      .slice(0, 3)
      .reduce((sum: number, stone: any) => sum + (+stone?.retail_value || 0), 0);

    // Get the current discount percentage
    const discountPercentage = +order?.discount || 0;

    // Calculate new discount amount based on new retail making charge
    const newDiscountAmount = (discountPercentage / 100.000) * newRetailMakingCharge;

    const diff = order._lastValidMakingCharge - order.retail_making_charge;

    const newTotalPrice = order.amount - diff;

    // Update the order object
    order.amount = +newTotalPrice.toFixed(this.defaultDecimalPlaces);

    // Update shared service with new discount amount
    this._posSharedService.setDiscountAmount(newDiscountAmount);

    // Recalculate grand total with VAT
    this.calcGrandTotalWithVat();

    // Calculate VAT based on new total price
    const vatAmount = this.calculateVat(newTotalPrice, order.selectedVatId ?? this.selectedVatId);

    const updatedPrices = {
      making_charge: +newRetailMakingCharge,
      vat_id: order.selectedVatId ?? this.selectedVatId,
    }

    this._posService.updateOrderValues(order.id, updatedPrices).subscribe({
      next: res => {
        updateOrderFromResponse(order, res);
        order._lastValidMakingCharge = order.retail_making_charge;
      },
      error: () => {
        order.retail_making_charge = order._lastValidMakingCharge;
        this._toaster.showError("Failed to update making charge");
      }
    });
  }

  calculateOrderGoldPriceBasedOnPurity(group: any): number {
    if (
      !group?.gold_price ||
      !group?.purity ||
      !group?.purity_value ||
      !this.selectedCurrency?.currency_decimal_point
    ) {
      return 0;
    }

    let purityFactor;

    if (group.purity_value) {
      purityFactor = +group.purity_value
    } else {
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
    }

    const goldPrice = group.gold_price * purityFactor;

    // Format based on selected currency decimal point
    this._posSharedService.setGoldPrice(+goldPrice.toFixed(this.defaultDecimalPlaces));

    return +goldPrice.toFixed(this.defaultDecimalPlaces);
  }

  calcMetalValueAccordingToPurity(group: any) {
    const metalValue = +(group.gold_price * group?.weight).toFixed(this.defaultDecimalPlaces);

    this._posSharedService.setMetalValue(metalValue);

    return metalValue;
  }

  calcTotalPrice(group: any): number {
    this.priceOfProductToPatch = 0;

    const metalValue = this.calcMetalValueAccordingToPurity(group);


    const makingCharge = +group?.retail_making_charge || 0;

    const discountPercentage = +group?.discount || 0;

    // Calculate discount amount
    const discountAmount = (discountPercentage / 100.000) * makingCharge;

    // Share the discount amount with the service
    this._posSharedService.setDiscountAmount(discountAmount);

    const discountedMakingCharge = makingCharge - discountAmount;

    const stoneValues = (group?.stones || [])
      .slice(0, 3)
      .reduce((sum: number, stone: any) => sum + (+stone?.retail_value || 0), 0);

    // const total = metalValue + discountedMakingCharge + stoneValues;
    const total = +(group?.amount ?? group.price ?? (metalValue + discountedMakingCharge + stoneValues));

    this.priceOfProductToPatch = +total.toFixed(this.defaultDecimalPlaces);

    return +total.toFixed(this.defaultDecimalPlaces);
  }

  onVatChange(vatId: number, group: any): void {
    group.selectedVat = vatId;

    const vat = this.taxes.find((t: { id: number }) => t.id === vatId);
    const vatRate = vat?.rate || 0;

    // Patch VAT rate into the form
    this.productForm.get('vat')?.patchValue(vatRate);

    // Recalculate grand total with VAT
    this.calcGrandTotalWithVat();

    const totalPrice = this.calcTotalPrice(group);
    const vatAmount = this.calculateVat(totalPrice, vatId);

    // Track if it's the first or second+ selection
    if (!group._vatSelectedOnce) {
      group._vatSelectedOnce = true; // first time, don't send
    } else {
      // second time or more, send to backend
      const pId = group?.id;
      const form = this._formBuilder.group({
        vat_id: vatId
      });

      this._posService.updateProductItem(pId, form.value).subscribe(result => {
      });
    }
  }

  calculateVat(totalPrice: number, selectedVatId: number) {
    const selectedTax = this.taxes.find((tax: { id: any; }) => tax.id === selectedVatId);
    const vatRate = selectedTax?.rate ? +selectedTax.rate : 0;
    return +((vatRate / 100) * totalPrice).toFixed(this.defaultDecimalPlaces);
  }

  calcTotalPriceWithVat(group: any): number {
    this.priceOfProductToPatch = 0
    const baseTotal = this.calcTotalPrice(group);

    const selectedTax = this.taxes.find((tax: { id: any; }) => tax.id === group.selectedVat);
    const vatRate = selectedTax?.rate ? +selectedTax.rate : 0;
    const vatAmount = (vatRate / 100) * baseTotal;

    const totalVat = this.salesDataOrders.reduce((acc: number, group: any) => {
      const baseTotal = this.calcTotalPrice(group); // your existing method

      const selectedTax = this.taxes.find((tax: { id: any }) => tax.id === group.selectedVat);
      const vatRate = selectedTax?.rate ? +selectedTax.rate : 0;
      const vatAmount = (vatRate / 100) * baseTotal;
      return acc + vatAmount;
    }, 0);

    // Update shared VAT immediately
    this._posSharedService.setSalesTax(+totalVat.toFixed(this.defaultDecimalPlaces));

    const totalWithVat = baseTotal + vatAmount;
    return +totalWithVat.toFixed(this.defaultDecimalPlaces);
  }

  calcGrandTotalWithVat(): number {
    if (!this.salesDataOrders || this.salesDataOrders.length === 0) return 0;

    const total = this.salesDataOrders.reduce((sum: number, group: any) => {
      return sum + this.calcTotalPriceWithVat(group);
    }, 0);

    this._posSharedService.setSalesTotalGrand(+total.toFixed(this.defaultDecimalPlaces));

    return +total.toFixed(this.defaultDecimalPlaces);
  }

  onProductSelected(productId: number): void {
    const selectedProduct = this.products.find((p: any) => p.id === productId);

    if (!selectedProduct.gold_price) {
      selectedProduct.gold_price = this.calculateInitialGoldPriceBasedOnPurity(selectedProduct);
    }

    if (!selectedProduct) return;

    this._posService.getBranchTax(this.shiftData?.branch).subscribe(res => {
      const tempGroup = {
        purity: selectedProduct.purity_name,
        price: selectedProduct.price,
        purity_value: selectedProduct.purity_value,
        weight: selectedProduct.weight,
        stones: selectedProduct.stones || [],
        retail_making_charge: selectedProduct.retail_making_charge,
        discount: selectedProduct.discount || 0,
        max_discount: selectedProduct.max_discount,
        selectedVat: this.selectedVatId,
        gold_price: selectedProduct.gold_price
      };

      const goldPrice = this.calculateOrderGoldPriceBasedOnPurity(tempGroup);
      const metalValue = this.calcMetalValueAccordingToPurity(tempGroup);
      const totalPrice = this.calcTotalPrice(tempGroup);
      const totalWithVat = this.calcTotalPriceWithVat(tempGroup);
      const vatAmount = this.calculateVat((+selectedProduct.price || totalPrice), this.selectedVatId);

      const payload = {
        product: selectedProduct.id,
        amount: +selectedProduct.price || totalPrice,
        vat_id: this.selectedVatId,
        metal_value: metalValue,
        gold_price: selectedProduct.gold_price
      };

      this._posService.addProductSale(payload).subscribe({
        next: res => {
          this._posSalesService.getSalesOrdersFromServer(); // Refresh after post
        },
        error: err => {
          this._toaster.showError("Cannot add sales product")
        },
        complete: () => {
          this.getProductList()
        }
      });
    });
  }

  get totalPrice(): string {
    const total = this.salesDataOrders.reduce((sum: Decimal, group: any) => {
      return sum.plus((group.amount || 0.000));
    }, new Decimal(0.000));

    // Truncate (not round) to 3 decimals, then format as string with 3 decimals
    const truncated = total.toDecimalPlaces(this.defaultDecimalPlaces, Decimal.ROUND_DOWN);
    const formattedTotal = truncated.toFixed(this.defaultDecimalPlaces);

    this._posSharedService.setSalesTotalPrice(+formattedTotal);

    return formattedTotal;
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
}

// Helper function to update order from response
function updateOrderFromResponse(order: any, res: any) {
  if (!res) return;
  if ('amount' in res) order.amount = +res.amount;
  if ('vat_amount' in res) order.vat_amount = +res.vat_amount;
  if ('metal_value' in res) order.metal_value = +res.metal_value;
  if ('gold_price' in res) order.gold_price = +res.gold_price;
  if ('retail_making_charge' in res) order.retail_making_charge = +res.retail_making_charge;
  if ('discount' in res) order.discount = +res.discount;
  if ('max_discount' in res) order.max_discount = +res.max_discount;
  // Add more fields as needed
}
