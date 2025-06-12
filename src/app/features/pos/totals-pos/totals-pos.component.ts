import { AfterContentInit, AfterViewChecked, AfterViewInit, Component, ComponentRef, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
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
import { PosPurchaseService } from '../@services/pos-purchase.service';
import { PosRepairService } from '../@services/pos-repair.service';
import { PosSilverService } from '../@services/pos-silver.service';
import { PosDiamondService } from '../@services/pos-diamond.service';
import { PosGoldReceiptService } from '../@services/pos-gold-receipt.service';
import { PosReturnsService } from '../@services/pos-returns.service';
import { AddCustomerPopupComponent } from '../../../shared/components/add-customer-popup/add-customer-popup.component';

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
    private _posPurchaseService: PosPurchaseService,
    private _posRepairService: PosRepairService,
    private _posReturnService: PosReturnsService,
    private _posSilverService: PosSilverService,
    private _posDiamondService: PosDiamondService,
    private _posGoldService: PosGoldReceiptService,
    private _posSharedService: PosSharedService) {

  }

  ngAfterViewInit(): void {
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
      this.onChangeCurrency();    
    }
    this._posStatusService.checkShiftStatus(); // Trigger refresh

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
    const decimalPlaces = this.selectedCurrency?.currency_decimal_point ?? 3;
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
      // (this.totalForm.get('payments') as FormArray).at(0).patchValue({
      //   amount: this.totalWithVat
      // });
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

       this.totalForm.get('customer')?.valueChanges.subscribe(customerId => {
      if (customerId) {
        sessionStorage.setItem('customer', customerId);
        this._posReturnService.refetchReceiptsProducts(customerId);
      }
    });
  this._posSharedService.refreshCurrency$.subscribe((res) => {
    this.getCurrencies(res);
  });
  }
  onChangeCurrency() {
    const currencyControl = this.totalForm.get('currency');

    currencyControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(currencyValue => {
        sessionStorage.setItem('currency', currencyValue);
        this.selectedCurrency = this.currencies.find(
          (currency: any) => currency.pk == (currencyValue ?? sessionStorage.getItem('currency'))
        );        
        this._posSharedService.setSelectedCurrency(this.selectedCurrency);
        this._posSharedService.selectedCurrency$.subscribe(res=>{
          
        })
        
      });

    // Manually trigger once on init or after patch
    const initialValue = currencyControl?.value;
    if (initialValue) {
      sessionStorage.setItem('currency', initialValue);
      this.selectedCurrency = this.currencies.find(
        (currency: any) => currency.pk == initialValue
      );
      this._posSharedService.setSelectedCurrency(this.selectedCurrency);
    }
  }
  getCurrencies(curr?:any) {
    this._posService.getCurrenciesByBranchId(curr ?? this.shiftData?.branch).subscribe((res: any) => {
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
paymentsFromPopup:any[] =[]
  openMultiPaymentMethods() {
    this.container.clear();
    this.componentRef = this.container.createComponent(PaymentMethodsPopupComponent);
    this.componentRef.instance.visible = true;
    this.componentRef.instance.baymentMethods = this.paymnetMethods;
 this.componentRef.instance.onSubmitPayments.subscribe((payments: any[]) => {
  console.log('Received payments:', payments);
  this.paymentsFromPopup = payments;

  const paymentFormArray = this.totalForm.get('payments') as FormArray;
  paymentFormArray.clear(); // Clear the existing one

  payments.forEach(payment => {
    paymentFormArray.push(this._formBuilder.group({
      payment_method: [payment.payment_method, Validators.required],
      amount: [payment.amount, Validators.required]
    }));
  });

  console.log(this.totalForm.value);

  this.onPlaceOrder(this.totalForm.value, true);
});
  }

  openOrderInvoice(){
        this.container.clear();
    this.componentRef = this.container.createComponent(PlaceOrderInvoiceComponent);
    this.componentRef.instance.showDialog();
  }
onPlaceOrder(form?:any,isPopup:boolean= false) {
    console.log(form);

  if (this.totalForm.invalid) {
    this.totalForm.markAllAsTouched();
    return;
  }

  this.totalForm.get('currency')?.patchValue(parseInt(this.selectedCurrency?.pk));
  console.log(form);
  console.log(this.totalForm.value);
  
  if (isPopup === false) {
  const paymentMethodId = form?.payment_method || this.totalForm?.value.payments[0].payment_method;
    const fallbackPayment = [{
      payment_method: paymentMethodId,
      amount: this.totalWithVat
    }];

    // Clear and rebuild payments FormArray
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
      this._posService.addOrder(res.order_id, form ?? this.totalForm.value).subscribe({
        next: res => {
          this.totalPrice = 0;
          this.discountAmount = 0;
          this.totalWithVat = 0;
          this.totalVat = 0;
          sessionStorage.removeItem('customer');
          this.totalForm.get('customer')?.patchValue(null)
          this.totalForm.get('payments')?.reset();
          this.totalForm.get('currency')?.patchValue(parseInt(sessionStorage?.getItem('currency') || ''));
          this.openOrderInvoice();
          this._posSharedService.notifyOrderPlaced();
          this._posSharedService.notifyReturnsOrderPlaced();
          this._posSalesService.getSalesOrdersFromServer();
          this._posDiamondService.fetchDiamondOrders();
          this._posSilverService.fetchSilverOrders();
          this._posPurchaseService.fetchPurchaseProducts();
          this._posGoldService.fetchGoldReceiptProducts();
          this._posRepairService.fetchRepairProducts();
          this._posReturnService.fetchReturnOrders();
          this._posSharedService.setTotalPrice(0);
          this._posSharedService.setGrandTotalWithVat(0);
          this._posSharedService.setVat(0);
          this._posSharedService.setDiscountAmount(0);

        },
        error: () => {
          
          // this.totalForm.get('currency')?.patchValue(parseInt(sessionStorage?.getItem('currency') || ''));
        },
        complete:()=>{

          // this.totalForm.get('currency')?.patchValue(parseInt(sessionStorage?.getItem('currency') || ''));
        }
      });
    }
  });
}
openAddCustomerPopup() {
  this.container.clear();
  this.componentRef = this.container.createComponent(AddCustomerPopupComponent);
  this.componentRef.instance.visible = true;

  // 👇 Subscribe to the event to refresh customers
  this.componentRef.instance.customerAdded.subscribe((res:any) => {
    this.reloadCustomers(res);
  });
}

reloadCustomers(data:any) {
  this._dropDownsService.getCustomers().subscribe(res => {
    this.customers = res?.results;
    if(data && data?.id){
      this.totalForm.get('customer')?.patchValue(data?.id)
    }
  });
}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}