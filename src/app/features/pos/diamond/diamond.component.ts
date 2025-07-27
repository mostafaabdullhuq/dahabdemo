import { Component, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { PosSharedService } from '../@services/pos-shared.service';
import { PosService } from '../@services/pos.service';
import { PosStatusService } from '../@services/pos-status.service';
import { PosDiamondService } from '../@services/pos-diamond.service';
import { SetDiscountComponent } from '../sales-pos/set-discount/set-discount.component';
import { Currency, Tax } from '../interfaces/pos.interfaces';

@Component({
  selector: 'app-diamond',
  standalone: false,
  templateUrl: './diamond.component.html',
  styleUrl: './diamond.component.scss'
})
export class DiamondComponent implements OnInit, OnDestroy {
  products: any = [];
  productForm!: FormGroup;
  diamondDataOrders: any = [];
  cols: any = [];
  selectedVat: any = ''
  taxes: Tax[] = [];
  salesProduct: any = [];
  menuItem: MenuItem[] = [];
  selectedCurrency: Currency | null = null;
  private destroy$ = new Subject<void>();
  defualtVat = 0;
  shiftData: any = [];
  isSelectedCustomerAndCurrency: boolean = true;
  selectedVatId: any = null;
  constructor(private _formBuilder: FormBuilder, private _posDiamondService: PosDiamondService, private _posService: PosService,
    private _dropdownService: DropdownsService, private _posSharedService: PosSharedService, private _posStatusService: PosStatusService
  ) { }


  ngOnInit(): void {
    this.productForm = this._formBuilder.group({
      product_id: ['', Validators.required]
    })

    this._posService.getProductDiamondList().subscribe((res) => {
      this.products = res?.results;
    });

    this._dropdownService.getTaxes().subscribe((res) => {
      this.taxes = res?.results;
      this.selectedVatId = this.taxes[0].id; // Set first VAT as default
    });

    this.getDiamondOrder()

    this._posStatusService.shiftData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.shiftData = data;
        if (this.shiftData && this.shiftData?.is_active) {
          this._posService.getProductDiamondList().subscribe((res) => {
            this.products = res?.results;
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

        if (!status)
          this.selectedCurrency = null
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
  }

  isShiftActive: boolean = false;
  selectedRowData: any = [];
  componentRef!: ComponentRef<SetDiscountComponent>;
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  setDiscount() {
    this.container.clear();
    this.componentRef = this.container.createComponent(SetDiscountComponent);
    this.componentRef.instance.selectedRow = this.selectedRowData;
    this.componentRef.instance.visible = true;
    this.componentRef.instance.parentTab = "diamond"
  }

  onRowClick(rowData: any): void {
    this.selectedRowData = rowData;
  }

  getProductList() {
    this._posService.getProductDiamondList().subscribe((res) => {
      this.products = res?.results;
    });
  }

  getDiamondOrder() {
    this._posDiamondService.diamondOrders$
      .subscribe((res: any) => {
        this.diamondDataOrders = res;
        if (this.diamondDataOrders.length === 0) {
          this._posSharedService.setDiamondTax(0);
          this._posSharedService.setDiamondTotalGrand(0);
          this._posSharedService.setDiamondTotalPrice(0);
          this._posSharedService.setDiamondDiscountAmount(0);
        }
      });

    // initial load
    this._posDiamondService.fetchDiamondOrders();
  }

  removeItem(id: any) {
    this._posService.deleteProductPos(id).subscribe({
      next: res => {
        this._posDiamondService.fetchDiamondOrders();
      },
      error: () => { },
      complete: () => {
        this.getProductList()
      }

    })
  }

  get totalPrice(): number {
    const total = this.diamondDataOrders?.reduce((sum: any, group: { amount: any; }) => sum + (+group.amount || 0), 0) || 0;
    this._posSharedService.setDiamondTotalPrice(+total)
    return total
  }

  priceOfProductToPatch: any = 0;

  calcMetalValueAccordingToPurity(group: any) {
    const decimalPlaces = this.selectedCurrency?.currency_decimal_point;
    const metalValue = +(group.price);
    this._posSharedService.setMetalValue(+metalValue.toFixed(decimalPlaces));
    return +metalValue.toFixed(decimalPlaces);
  }

  calcTotalPrice(group: any): number {
    this.priceOfProductToPatch = 0;
    const metalValue = this.calcMetalValueAccordingToPurity(group);

    const makingCharge = +group?.retail_making_charge || 0;
    const discountPercentage = +group?.discount || 0;

    // Calculate discount amount
    const discountAmount = (discountPercentage / 100) * makingCharge;

    // Share the discount amount with the service
    this._posSharedService.setDiamondDiscountAmount(discountAmount);

    const discountedMakingCharge = makingCharge - discountAmount;

    const stoneValues = (group?.stones || [])
      .slice(0, 3)
      .reduce((sum: number, stone: any) => sum + (+stone?.retail_value || 0), 0);

    const total = metalValue + discountedMakingCharge + stoneValues;

    const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 3;

    this.priceOfProductToPatch = +total.toFixed(decimalPlaces);

    return +total.toFixed(decimalPlaces);
  }
  onVatChange(vatId: number, group: any): void {
    group.selectedVat = vatId;

    const vat = this.taxes.find((t: { id: number }) => t.id === vatId);
    const vatRate = vat?.rate ? +vat.rate : 0;

    // Patch VAT rate into the form
    this.productForm.get('vat')?.patchValue(vatRate);


    const totalPrice = this.calcTotalPrice(group);

    const vatAmount = this.calculateVat(totalPrice, group.selectedVatId ?? this.selectedVatId);

    // Recalculate grand total with VAT
    this.calcGrandTotalWithVat();

    // Track if it's the first or second+ selection
    if (!group._vatSelectedOnce) {
      group._vatSelectedOnce = true; // first time, don't send
    } else {
      // second time or more, send to backend
      const pId = group?.id;
      const form = this._formBuilder.group({
        vat_amount: [vatAmount]
      });
      this._posService.updateProductItem(pId, form.value).subscribe();
    }
  }


  calculateVat(totalPrice: number, selectedVatId: number) {
    const selectedTax = this.taxes.find((tax: { id: any; }) => tax.id === selectedVatId);
    const vatRate = selectedTax?.rate ? +selectedTax.rate : 0;
    return +((vatRate / 100) * totalPrice).toFixed(3);
  }


  calcTotalPriceWithVat(group: any): number {
    this.priceOfProductToPatch = 0
    const baseTotal = this.calcTotalPrice(group);
    const selectedTax = this.taxes.find((tax: { id: any; }) => tax.id === group.selectedVat);
    const vatRate = selectedTax?.rate ? +selectedTax.rate : 0;
    const vatAmount = (vatRate / 100) * baseTotal;
    const totalVat = this.diamondDataOrders.reduce((acc: number, group: any) => {
      const baseTotal = this.calcTotalPrice(group); // your existing method
      const selectedTax = this.taxes.find((tax: { id: any }) => tax.id === group.selectedVat);
      const vatRate = selectedTax?.rate ? +selectedTax.rate : 0;
      const vatAmount = (vatRate / 100) * baseTotal;
      return acc + vatAmount;
    }, 0);

    // Update shared VAT immediately
    const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 2;
    this._posSharedService.setDiamondTax(+totalVat.toFixed(decimalPlaces));

    const totalWithVat = baseTotal + vatAmount;
    return +totalWithVat.toFixed(decimalPlaces);
  }

  calcGrandTotalWithVat(): number {
    if (!this.diamondDataOrders || this.diamondDataOrders.length === 0) return 0;

    const total = this.diamondDataOrders.reduce((sum: number, group: any) => {
      return sum + this.calcTotalPriceWithVat(group);
    }, 0);

    const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 2;
    this._posSharedService.setDiamondTotalGrand(+total.toFixed(decimalPlaces));

    return +total.toFixed(decimalPlaces);
  }

  onProductSelected(productId: number): void {
    const selectedProduct = this.products.find((p: any) => p.id === productId);
    if (!selectedProduct) return;
    this._posService.getBranchTax(this.shiftData?.branch).subscribe(res => {
      const branchTaxNo = res?.tax_rate || 0;
      const tempGroup = {
        purity: selectedProduct.purity_name,
        price: selectedProduct.price,
        purity_value: selectedProduct.purity_value,
        weight: selectedProduct.weight,
        stones: selectedProduct.stones || [],
        retail_making_charge: selectedProduct.retail_making_charge,
        discount: selectedProduct.discount || 0,
        max_discount: selectedProduct.max_discount,
        selectedVat: this.selectedVatId
      };

      const metalValue = this.calcMetalValueAccordingToPurity(tempGroup);
      const totalPrice = this.calcTotalPrice(tempGroup);
      const vatAmount = this.calculateVat(totalPrice, tempGroup.selectedVat ?? this.selectedVatId);

      const payload = {
        product: selectedProduct.id,
        amount: totalPrice,
        vat_amount: vatAmount,
      };

      this._posDiamondService.addProductDiamond(payload).subscribe({
        next: res => {
          this._posDiamondService.fetchDiamondOrders(); // Refresh after post
        },
        error: err => {
          console.error('Error posting product', err);
        },
        complete: () => {
          this.getDiamondOrder()
          this.getProductList()
        }
      });
    });
  }

  // onProductSelected(productId: number): void {
  //   const selectedProduct = this.products.find((p: any) => p.id === productId);
  //   if (!selectedProduct) return;
  //   const payload = {
  //     product: selectedProduct.id,
  //     amount: selectedProduct.amount //selectedProduct.retail_making_charge
  //   };

  //   this._posDiamondService.addProductSilver(payload)
  //     .subscribe({
  //       next: res => {
  //         this._posDiamondService.fetchDiamondOrders();
  //       },
  //       error: err => {
  //         console.error('Error posting product', err);
  //       }
  //     });
  // }
  // get totalPrice(): number {
  //   const total = this.silverDataOrders.reduce((sum: number, group: any) => {
  //     return sum + group?.amount;
  //   }, 0);

  //   const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 3;
  //   const formattedTotal = +total.toFixed(decimalPlaces);
  //   return formattedTotal;
  // }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

