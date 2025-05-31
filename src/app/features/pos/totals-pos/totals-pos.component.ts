import { AfterContentInit, AfterViewChecked, AfterViewInit, Component, ComponentRef, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosService } from '../@services/pos.service';
import { PosStatusService } from '../@services/pos-status.service';
import { combineLatest, debounceTime, EMPTY, Subject, takeUntil } from 'rxjs';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { PosSharedService } from '../@services/pos-shared.service';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesPosComponent } from '../sales-pos/sales-pos.component';
import { PaymentMethodsPopupComponent } from './payment-methods-popup/payment-methods-popup.component';
import { PosSalesService } from '../@services/pos-sales.service';
import { PlaceOrderInvoiceComponent } from '../place-order-invoice/place-order-invoice.component';

@Component({
  selector: 'app-totals-pos',
  standalone: false,
  templateUrl: './totals-pos.component.html',
  styleUrl: './totals-pos.component.scss'
})
export class TotalsPosComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  totalForm!: FormGroup;
  customers: any = [];
  currencies: any = [];
  shiftData: any = [];
  selectedCurrency: any = null;
  isShiftActive:boolean =false;
  paymnetMethods: any = []
  //Prices
  goldPrice: number = 0;
  metalValue: number = 0;
  totalPrice: number = 0;
  discountAmount: number = 0;
  totalWithVat: number = 0;
  totalVat: number = 0;
salesDataOrders:any =[];
  constructor(private _formBuilder: FormBuilder,
    private _dropDownsService: DropdownsService,
    private _posService: PosService,
    private _posStatusService: PosStatusService,
    private _posSalesService: PosSalesService,
    private _posSharedService: PosSharedService) {

  }
  ngAfterViewInit(): void {
    this.onChangeCurrency();    
  }
  ngOnInit(): void {
    
    this.totalForm = this._formBuilder.group({
      customer: ['', Validators.required],
      currency: ['', Validators.required],
      amount: [0 , Validators.required],
      discount: [this.discountAmount],
      tax: [this.totalVat],
      payments: this._formBuilder.array([
        this._formBuilder.group({
          payment_method: ['', Validators.required],
          amount: this.totalWithVat
        })
      ])
    });
    const savedCustomer = sessionStorage.getItem('customer') ;
    const savedCurrency = sessionStorage.getItem('currency');

    if (savedCustomer || savedCurrency) {
      this.totalForm.patchValue({
        customer: savedCustomer ? Number(savedCustomer) : '',
        currency: savedCurrency ? Number(savedCurrency) : ''
      });
    }
    this._posStatusService.shiftData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.shiftData = data;
        if (this.shiftData?.is_active) {
          this.getCurrencies();
        }
      });
    this._posService.getPaymentMethods().subscribe(res => {
      this.paymnetMethods = res
    })

    this._dropDownsService.getCustomers().subscribe(res => {
      this.customers = res?.results
    });

    this.totalForm.get('customer')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        sessionStorage.setItem('customer', value);
      });


    // 4. Listen for changes and update sessionStorage
    const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 2;
    this._posSharedService.goldPrice$.subscribe(price => {
      this.goldPrice = +price;
    });

    // Subscribe to the metal value
    this._posSharedService.metalValue$.subscribe(value => {
      this.metalValue = +value.toFixed(decimalPlaces);
    });

    // Subscribe to the total price
    this._posSharedService.totalPrice$.subscribe(price => {
      this.totalPrice = +price;      
      this.totalForm.get('amount')?.patchValue(this.totalPrice)      
    });

    // Subscribe to the discount
    this._posSharedService.discountAmount$.subscribe(disc => {
      this.discountAmount = +disc;
      this.totalForm.get('discount')?.patchValue(this.discountAmount)
    });

    // Subscribe to the total with vat
    this._posSharedService.grandTotalWithVat$.subscribe(vat => {
      this.totalWithVat = +vat;
      (this.totalForm.get('payments') as FormArray).at(0).patchValue({
        amount: this.totalWithVat
      });
    });

    // Subscribe to the vat
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
  onChangeCurrency() {
    const currencyControl = this.totalForm.get('currency');

    currencyControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(currencyValue => {
        sessionStorage.setItem('currency', currencyValue);
        this.selectedCurrency = this.currencies.find(
          (currency: any) => currency.currency == (currencyValue ?? sessionStorage.getItem('currency'))
        );
        this._posSharedService.setSelectedCurrency(this.selectedCurrency);
      });

    // Manually trigger once on init or after patch
    const initialValue = currencyControl?.value;
    if (initialValue) {
      sessionStorage.setItem('currency', initialValue);
      this.selectedCurrency = this.currencies.find(
        (currency: any) => currency.currency == initialValue
      );
      this._posSharedService.setSelectedCurrency(this.selectedCurrency);
    }
  }
  getCurrencies() {
    this._posService.getCurrenciesByBranchId(this.shiftData?.branch).subscribe((res: any) => {
      this.currencies = res?.results;
      const savedCustomer = sessionStorage.getItem('customer');
      const savedCurrency = sessionStorage.getItem('currency');
      if (savedCustomer || savedCurrency) {
        this.totalForm.patchValue({
          customer: savedCustomer ? Number(savedCustomer) : '',
          currency: savedCurrency ? Number(savedCurrency) : ''
        });
      }
    })
  }
  get paymentsControls() {
    return (this.totalForm.get('payments') as FormArray).controls;
  }
  componentRef!: ComponentRef<any>;
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  openMultiPaymentMethods() {
    this.container.clear();
    this.componentRef = this.container.createComponent(PaymentMethodsPopupComponent);
    this.componentRef.instance.visible = true;
    this.componentRef.instance.baymentMethods = this.paymnetMethods;

    this.componentRef.instance.onSubmitPayments.subscribe((payments: any[]) => {
      this.totalForm.patchValue({ payments }); // Push array to form
    });
  }

  openOrderInvoice(){
        this.container.clear();
    this.componentRef = this.container.createComponent(PlaceOrderInvoiceComponent);
    this.componentRef.instance.showDialog();
  }
onPlaceOrder() {
  if (this.totalForm.invalid) {
    // Optionally, you can show some error or mark the form as touched to display validation messages
    this.totalForm.markAllAsTouched();
    return; // Stop here if form is invalid
  }

  const formValue = this.totalForm.value;
  this.totalForm.get('currency')?.patchValue(this.selectedCurrency?.pk)
  // If no payments set, fallback to selected payment_method + totalWithVat
  if (!formValue.payments || formValue.payments.length === 0) {
    const paymentMethodId = this.totalForm.get('payment_method')?.value;

    if (paymentMethodId) {
      const fallbackPayment = [{
        payment_method: paymentMethodId,
        amount: this.totalWithVat
      }];
      this.totalForm.patchValue({ payments: fallbackPayment });
    }
  }

  this._posService.getOrderId().subscribe(res => {
    if (res?.order_id) {
      this._posService.addOrder(res.order_id, this.totalForm.value).subscribe({
        next: res => {
          this.totalForm.get('currency')?.patchValue(parseInt(sessionStorage?.getItem('currency') || ''))
            this.openOrderInvoice();
        }
      });
    }
  });
}


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}