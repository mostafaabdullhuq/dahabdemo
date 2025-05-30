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

@Component({
  selector: 'app-diamond',
  standalone: false,
  templateUrl: './diamond.component.html',
  styleUrl: './diamond.component.scss'
})
export class DiamondComponent  implements OnInit, OnDestroy{
  products: any = [];
  productForm!: FormGroup;
  silverDataOrders: any = [];
  cols: any = [];
  selectedVat: any = ''
  taxes: any = [];
  salesProduct: any = [];
  menuItem: MenuItem[] = [];
  manualGoldPrice = '';
  selectedCurrency: any = ''
  private destroy$ = new Subject<void>();
  defualtVat = 0;
  shiftData: any = [];
  isSelectedCustomerAndCurrency:boolean = true; 
  selectedVatId: any = null;
  constructor(private _formBuilder: FormBuilder, private _posDiamondService: PosDiamondService, private _posService: PosService,
    private _dropdownService: DropdownsService, private _posSharedService: PosSharedService, private _posStatusService: PosStatusService
  ) { }


  ngOnInit(): void {
    this.productForm = this._formBuilder.group({
      product_id: ['', Validators.required]
    })
    
    this._posService.getProductSalesList().subscribe((res) => {
      this.products = res?.results;
    });
    this._dropdownService.getTaxes().subscribe((res) => {
      this.taxes = res?.results;
      this.selectedVatId = this.taxes[0].id; // Set first VAT as default
    });
    this.getSalesOrder()
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
        if (!status)
          this.selectedCurrency = ''
      });

    this.menuItem = [
      {
        label: 'Set Discount',
        icon: 'pi pi-percentage',
        command: () => {
          this.setDiscount(this.selectedRowData?.id);
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
  }
  isShiftActive:boolean = false;
  selectedRowData: any = [];
    componentRef!: ComponentRef<SetDiscountComponent>;
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  setDiscount(id: any) {
     this.container.clear();
        this.componentRef = this.container.createComponent(SetDiscountComponent);
        this.componentRef.instance.selectedRowId= id;
        this.componentRef.instance.visible = true;
  }
  onRowClick(rowData: any): void {
    this.selectedRowData = rowData;
  }
  getSalesOrder() {
    this._posDiamondService.returnOrders$
      .subscribe((res: any) => {
        this.silverDataOrders = res;
      });

    // initial load
    this._posDiamondService.fetchDiamondOrders();
  }
  removeItem(id: any) {
    this._posService.deleteProductPos(id).subscribe({
      next: res => {
        this._posDiamondService.fetchDiamondOrders();
      },
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
    return +goldPrice.toFixed(decimalPlaces);
  }

priceOfProductToPatch:any = 0;

  onProductSelected(productId: number): void {
    const selectedProduct = this.products.find((p: any) => p.id === productId);
    if (!selectedProduct) return;    
    const payload = {
      product: selectedProduct.id,
      amount: selectedProduct.amount //selectedProduct.retail_making_charge
    };

    this._posDiamondService.addProductSilver(payload)
      .subscribe({
        next: res => {
          this._posDiamondService.fetchDiamondOrders();
        },
        error: err => {
          console.error('Error posting product', err);
        }
      });
  }
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

