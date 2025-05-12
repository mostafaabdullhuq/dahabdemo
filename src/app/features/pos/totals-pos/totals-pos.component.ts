import { AfterContentInit, AfterViewChecked, Component, ComponentRef, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosService } from '../@services/pos.service';
import { PosStatusService } from '../@services/pos-status.service';
import { combineLatest, debounceTime, EMPTY, Subject, takeUntil } from 'rxjs';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { PosSharedService } from '../@services/pos-shared.service';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesPosComponent } from '../sales-pos/sales-pos.component';
import { PaymentMethodsPopupComponent } from './payment-methods-popup/payment-methods-popup.component';

@Component({
  selector: 'app-totals-pos',
  standalone: false,
  templateUrl: './totals-pos.component.html',
  styleUrl: './totals-pos.component.scss'
})
export class TotalsPosComponent implements OnInit, OnDestroy, AfterViewChecked {
  private destroy$ = new Subject<void>();
  totalForm!: FormGroup;
  customers: any = [];
  currencies: any = [];
  shiftData: any = [];
  selectedCurrency: any = null;
  paymnetMethods: any = []
  //Prices
  goldPrice: number = 0;
  metalValue: number = 0;
  totalPrice: number = 0;
  discountAmount: number = 0;
  totalWithVat: number = 0;
  totalVat: number = 0;

  constructor(private _formBuilder: FormBuilder,
    private _dropDownsService: DropdownsService,
    private _posService: PosService,
    private _posStatusService: PosStatusService,
    private _posSharedService: PosSharedService) {

  }
  ngAfterViewChecked(): void {
    this.onChangeCurrency()
  }
  ngOnInit(): void {
    this.totalForm = this._formBuilder.group({
      customer_id: ['', Validators.required],
      currency_id: ['', Validators.required],
      payment_method: [''],
    });
    const savedCustomer = sessionStorage.getItem('customer_id') ?? '';
    const savedCurrency = sessionStorage.getItem('currency_id') ?? '';

    if (savedCustomer || savedCurrency) {
      this.totalForm.patchValue({
        customer_id: parseInt(savedCustomer) ?? '',
        currency_id: parseInt(savedCurrency) ?? ''
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

    this.totalForm.get('customer_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        sessionStorage.setItem('customer_id', value);
        console.log(value);

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
      this.totalPrice = +price
    });

    // Subscribe to the discount
    this._posSharedService.discountAmount$.subscribe(disc => {
      this.discountAmount = +disc;
    });

    // Subscribe to the total with vat
    this._posSharedService.grandTotalWithVat$.subscribe(vat => {
      this.totalWithVat = +vat;
    });

    // Subscribe to the vat
    this._posSharedService.vat$.subscribe(vat => {
      this.totalVat = +vat;
    });
  }
  onChangeCurrency() {
    const currencyControl = this.totalForm.get('currency_id');

    currencyControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(currencyValue => {
        sessionStorage.setItem('currency_id', currencyValue);
        this.selectedCurrency = this.currencies.find(
          (currency: any) => currency.currency == (currencyValue ?? sessionStorage.getItem('currency_id'))
        );
        this._posSharedService.setSelectedCurrency(this.selectedCurrency);
      });

    // Manually trigger once on init or after patch
    const initialValue = currencyControl?.value;
    if (initialValue) {
      sessionStorage.setItem('currency_id', initialValue);
      this.selectedCurrency = this.currencies.find(
        (currency: any) => currency.currency == initialValue
      );
      this._posSharedService.setSelectedCurrency(this.selectedCurrency);
    }
  }
  getCurrencies() {
    this._posService.getCurrenciesByBranchId(this.shiftData?.branch).subscribe((res: any) => {
      this.currencies = res?.results
    })
  }

  componentRef!: ComponentRef<PaymentMethodsPopupComponent>;
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  openMultiPaymentMethods() {
    this.container.clear();
    this.componentRef = this.container.createComponent(PaymentMethodsPopupComponent);
    this.componentRef.instance.visible = true;
    this.componentRef.instance.baymentMethods = this.paymnetMethods;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}