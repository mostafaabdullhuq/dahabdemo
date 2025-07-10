import { ChangeDetectorRef, Component, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosService } from '../@services/pos.service';
import { PosStatusService } from '../@services/pos-status.service';
import { Subject, takeUntil } from 'rxjs';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { PosSharedService } from '../@services/pos-shared.service';
import { PaymentMethodsPopupComponent } from './payment-methods-popup/payment-methods-popup.component';
import { PosSalesService } from '../@services/pos-sales.service';
import { PlaceOrderInvoiceComponent } from '../place-order-invoice/place-order-invoice.component';
import { PosPurchaseService } from '../@services/pos-purchase.service';
import { PosRepairService } from '../@services/pos-repair.service';
import { PosSilverService } from '../@services/pos-silver.service';
import { PosDiamondService } from '../@services/pos-diamond.service';
import { PosGoldReceiptService } from '../@services/pos-gold-receipt.service';
import { PosReturnsService } from '../@services/pos-returns.service';
import { AddCustomerPopupComponent } from '../../../shared/components/add-customer-popup/add-customer-popup.component';
import { Customer, Currency, PaymentMethod, BranchTax, ShiftData } from '../interfaces/pos.interfaces';

@Component({
  selector: 'app-totals-pos',
  standalone: false,
  templateUrl: './totals-pos.component.html',
  styleUrl: './totals-pos.component.scss'
})
export class TotalsPosComponent implements OnInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  private destroy$ = new Subject<void>();

  componentRef!: ComponentRef<any>;
  paymentsFromPopup: any[] = []

  totalForm!: FormGroup;
  customers: Customer[] = [];
  currencies: Currency[] = [];
  shiftData: ShiftData | null = null;

  selectedCurrency: Currency | null = null;
  selectedCustomer: Customer | null = null;

  isShiftActive: boolean = false;
  paymnetMethods: PaymentMethod[] = [];

  //Prices
  goldPrice: number = 0;
  metalValue: number = 0;
  totalPrice: number = 0;
  discountAmount: number = 0;
  totalWithVat: number = 0;
  totalVat: number = 0;
  salesDataOrders: any = [];
  branchTax: BranchTax | null = null;

  constructor(private _formBuilder: FormBuilder,
    private _dropDownsService: DropdownsService,
    private _posService: PosService,
    private _posStatusService: PosStatusService,
    private _posSalesService: PosSalesService,
    private _posPurchaseService: PosPurchaseService,
    private _posRepairService: PosRepairService,
    private _posReturnService: PosReturnsService,
    private _posSilverService: PosSilverService,
    private _posDiamondService: PosDiamondService,
    private _posGoldService: PosGoldReceiptService,
    private _posSharedService: PosSharedService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._posStatusService.updateShiftStatus();

    this.totalForm = this._formBuilder.group({
      customer: [null, Validators.required],
      currency: [null, Validators.required],
      amount: [0, Validators.required],
      discount: [this.discountAmount || 0],
      tax: [this.totalVat],
      payments: this._formBuilder.array([
        this._formBuilder.group({
          payment_method: ['', Validators.required],
          amount: this.totalWithVat
        })
      ])
    });

    this.setupFormSubscriptions();
    this.setupServiceSubscriptions();
  }

  private setupFormSubscriptions(): void {
    this.totalForm.get('customer')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe(customerId => {
        this.handleCustomerChange(customerId);
      });

    this.totalForm.get('currency')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe(currencyId => {
        this.handleCurrencyChange(currencyId);
      });
  }

  private getBranchTax(branchId: number) {

    this._posService.getBranchTax(branchId).subscribe(result => {

      this.branchTax = result;
    })
  }

  private setupServiceSubscriptions(): void {
    // this.restoreSessionData();

    this._posStatusService.shiftData$
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe(data => {
        this.shiftData = data;

        this.isShiftActive = data?.is_active ?? false;

        if (this.shiftData?.is_active) {
          if (this.shiftData.branch) {
            this.getBranchTax(this.shiftData.branch);
          }

          this.getCustomers(() => {
            this.getCurrencies(() => {
              this.restoreSessionData();
            });
          });
        } else {
          this.currencies = [];
          this.customers = [];
          this.selectedCustomer = null;
          this.selectedCurrency = null;
          this.totalForm.reset();
        }
      });

    this._posSharedService.refreshCurrency$
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        if (this.shiftData?.is_active) {
          this.getCurrencies();
        }
      });

    this._posService.getPaymentMethods().subscribe(res => {
      this.paymnetMethods = res || [];
    });

    const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 3;

    this._posSharedService.goldPrice$.subscribe(price => {
      this.goldPrice = +price;
    });

    this._posSharedService.metalValue$.subscribe(value => {
      this.metalValue = +value.toFixed(decimalPlaces);
    });

    this._posSharedService.totalPrice$.subscribe(price => {
      this.totalPrice = +price;
      this.totalForm.get('amount')?.patchValue(this.totalPrice)
    });

    this._posSharedService.discountAmount$.subscribe(disc => {
      this.discountAmount = +disc;
      this.totalForm.get('discount')?.patchValue(this.discountAmount)
    });

    this._posSharedService.grandTotalWithVat$.subscribe(vat => {
      this.totalWithVat = +vat;
    });

    this._posSharedService.vat$.subscribe(vat => {
      this.totalVat = +vat;
      this.totalForm.get('tax')?.patchValue(this.totalVat)
    });

    this._posStatusService.shiftActive$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isShiftActive = status;
      });

    this._posSalesService._salesReciepts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.salesDataOrders = res;
      });
  }

  private restoreSessionData(): void {
    const savedCustomer = sessionStorage.getItem('customer');
    const savedCurrency = sessionStorage.getItem('currency');

    if (savedCustomer || savedCurrency) {

      if (savedCustomer) {
        if (this.customers?.length) {
          this.selectedCustomer = this.customers.find((customer: Customer) => customer.id == Number(savedCustomer)) ?? null;
        }
      }

      if (savedCurrency) {
        this.selectedCurrency = this.currencies.find((currency: Currency) => currency.pk == Number(savedCurrency)) ?? null;
      }

      this.totalForm.patchValue({
        customer: savedCustomer ? Number(savedCustomer) : '',
        currency: savedCurrency ? Number(savedCurrency) : ''
      });

    } else {
      // No saved data, ensure form is clean
      this.selectedCustomer = null;
      this.selectedCurrency = null;

      this.totalForm.patchValue({
        customer: '',
        currency: ''
      });
    }
  }

  private updateSharedServices(): void {
    // Always update both subjects to keep other components in sync
    this._posSharedService.setSelectedCustomer(this.selectedCustomer);
    this._posSharedService.setSelectedCurrency(this.selectedCurrency);
    this.cdr.detectChanges();
  }

  private handleCustomerChange(customerId: number | string): void {
    if (customerId) {
      sessionStorage.setItem('customer', customerId.toString());
      this._posReturnService.refetchReceiptsProducts(customerId);
      this._posService.getCustomerById(+customerId).subscribe(customer => {
        this.selectedCustomer = customer;
        this._posSharedService.setSelectedCustomer(this.selectedCustomer);
      });
    } else {
      // sessionStorage.removeItem("customer");
      this.selectedCustomer = null;
      this._posSharedService.setSelectedCustomer(this.selectedCustomer);
    }
  }

  private handleCurrencyChange(currencyValue: number | string): void {

    if (currencyValue) {
      sessionStorage.setItem('currency', currencyValue.toString());
      if (this.currencies?.length) {
        this.selectedCurrency = this.currencies.find((currency: Currency) => currency.pk == currencyValue) ?? null;
        this._posSharedService.setSelectedCurrency(this.selectedCurrency);
      } else {
        this.getCurrencies(() => {
          this.selectedCurrency = this.currencies.find((currency: Currency) => currency.pk == currencyValue) ?? null;
          this._posSharedService.setSelectedCurrency(this.selectedCurrency);
        })
      }
    } else {
      // sessionStorage.removeItem("currency");
      this.selectedCurrency = null;
      this._posSharedService.setSelectedCurrency(this.selectedCurrency);
    }

  }

  onCurrencyClear() {
    sessionStorage.removeItem("currency")
  }

  onCustomerClear() {
    sessionStorage.removeItem("customer")
  }

  getCurrencies(callbackOrCurr?: number | string | (() => void)) {
    let branchId: number | null;
    let callback: (() => void) | undefined;

    // Handle overloaded parameters
    if (typeof callbackOrCurr === 'function') {
      callback = callbackOrCurr;
    }

    branchId = this.shiftData?.branch ?? null;

    if (!branchId) return;

    this._posService.getCurrenciesByBranchId(branchId).subscribe((res) => {
      this.currencies = res?.results || [];

      if (callback) {
        callback();
      }
    })
  }

  getCustomers(callback: Function | null = null) {

    this._dropDownsService.getCustomers().subscribe(res => {
      this.customers = res?.results || [];

      this.customers.map(customer => {
        customer.display_value = customer.name;

        if (customer.cpr) {
          customer.display_value += ` - ${customer.cpr}`
        }

        return customer
      })


      if (callback) {
        callback();
      }
    });
  }


  get paymentsControls() {
    return (this.totalForm.get('payments') as FormArray).controls;
  }

  openMultiPaymentMethods(type: string = '') {
    this.container.clear();
    this.componentRef = this.container.createComponent(PaymentMethodsPopupComponent);
    this.componentRef.instance.visible = true;
    this.componentRef.instance.typeOfPayment = type;
    this.componentRef.instance.baymentMethods = this.paymnetMethods;
    this.componentRef.instance.onSubmitPayments.subscribe((payments: any[]) => {
      this.paymentsFromPopup = payments;

      const paymentFormArray = this.totalForm.get('payments') as FormArray;
      paymentFormArray.clear();

      payments.forEach(payment => {
        paymentFormArray.push(this._formBuilder.group({
          payment_method: [payment.payment_method, Validators.required],
          amount: [payment.amount, Validators.required]
        }));
      });


      this.onPlaceOrder(this.totalForm.value, true);
    });
  }

  openOrderInvoice() {
    this.container.clear();
    this.componentRef = this.container.createComponent(PlaceOrderInvoiceComponent);
    this.componentRef.instance.showDialog();
  }

  onPaymentMethodChange(paymentMethodId: number) {
    const fallbackPayment = [{
      payment_method: paymentMethodId,
      amount: this.totalWithVat
    }];

    const paymentFormArray = this.totalForm.get('payments') as FormArray;
    paymentFormArray.clear();
    fallbackPayment.forEach(payment => {
      paymentFormArray.push(this._formBuilder.group({
        payment_method: [payment.payment_method, Validators.required],
        amount: [payment.amount, Validators.required]
      }));
    });
  }

  onPlaceOrder(form?: any, isPopup: boolean = false) {

    if (this.totalForm?.invalid) {
      this.totalForm.markAllAsTouched();
      return;
    }

    this.totalForm.get('currency')?.patchValue(this.selectedCurrency?.pk ? parseInt(this.selectedCurrency.pk.toString()) : null);

    if (isPopup === false) {
      const paymentMethodId = form?.payment_method || this.totalForm?.value.payments[0].payment_method;
      const fallbackPayment = [{
        payment_method: paymentMethodId,
        amount: this.totalWithVat
      }];

      const paymentFormArray = this.totalForm.get('payments') as FormArray;
      paymentFormArray.clear();
      fallbackPayment.forEach(payment => {
        paymentFormArray.push(this._formBuilder.group({
          payment_method: [payment.payment_method, Validators.required],
          amount: [payment.amount, Validators.required]
        }));
      });
    }

    this._posService.getOrderId().subscribe(res => {
      if (res?.order_id) {
        if (this.totalForm.get("discount")?.value == null) {
          this.totalForm.get("discount")?.setValue(0)
        }
        this._posService.addOrder(res.order_id, form ?? this.totalForm.value).subscribe({
          next: res => {
            this.totalPrice = 0;
            this.discountAmount = 0;
            this.totalWithVat = 0;
            this.totalVat = 0;

            // Reset customer selection and update subjects
            sessionStorage.removeItem('customer');
            this.selectedCustomer = null;
            this.totalForm.get('customer')?.patchValue(null, { emitEvent: false });

            // Update shared services to notify other components
            this.updateSharedServices();

            this.totalForm.get('payments')?.reset();
            this.totalForm.get('currency')?.patchValue(parseInt(sessionStorage?.getItem('currency') || ''));
            this.openOrderInvoice();
            this._posSharedService.resetAllValues();
            this._posSharedService.notifyOrderPlaced();
            this._posSharedService.notifyReturnsOrderPlaced();
            this._posSalesService.getSalesOrdersFromServer();
            this._posDiamondService.fetchDiamondOrders();
            this._posSilverService.fetchSilverOrders();
            this._posPurchaseService.fetchPurchaseProducts();
            this._posGoldService.fetchGoldReceiptProducts();
            this._posRepairService.fetchRepairProducts();
            this._posReturnService.fetchReturnOrders();
            this._posSharedService.triggerRefreshCurrency();
          },
          error: () => {

          },
          complete: () => {

          }
        });
      }
    });
  }

  openAddCustomerPopup() {
    this.container.clear();
    this.componentRef = this.container.createComponent(AddCustomerPopupComponent);
    this.componentRef.instance.visible = true;

    this.componentRef.instance.customerAdded.subscribe((res: any) => {
      this.reloadCustomers(res);
    });
  }

  reloadCustomers(data: any) {
    this.getCustomers(() => {
      if (data && data?.id) {
        this.totalForm.get('customer')?.patchValue(data?.id)
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
