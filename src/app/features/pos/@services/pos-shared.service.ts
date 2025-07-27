import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { Currency, Customer } from '../interfaces/pos.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PosSharedService {
  private currencySource = new BehaviorSubject<Currency | null>(null);
  selectedCurrency$ = this.currencySource.asObservable();

  // Refetch currency
  private refreshCurrencySource = new Subject<void>();
  refreshCurrency$ = this.refreshCurrencySource.asObservable();

  private customerSource = new BehaviorSubject<Customer | null>(null);

  selectedCustomer$ = this.customerSource.asObservable();

  private orderPlacedSource = new Subject<void>();
  private returnOrderPlacedSource = new Subject<void>();

  orderPlaced$ = this.orderPlacedSource.asObservable();
  returnORrderPlaced$ = this.returnOrderPlacedSource.asObservable();

  // Prices
  private goldPriceSubject = new BehaviorSubject<number>(0);
  private metalValueSubject = new BehaviorSubject<number>(0);
  private totalPriceSubject = new BehaviorSubject<number>(0);
  private discountAmountSubject = new BehaviorSubject<number>(0);
  private diamondDiscountAmountSubject = new BehaviorSubject<number>(0);
  private salesDiscountAmountSubject = new BehaviorSubject<number>(0);
  private returnDiscountAmountSubject = new BehaviorSubject<number>(0);
  private silverDiscountAmountSubject = new BehaviorSubject<number>(0);
  private grandTotalWithVatSubject = new BehaviorSubject<number>(0);
  private vatValue = new BehaviorSubject<number>(0);
  private salesTotalGrandSubject = new BehaviorSubject<number>(0);
  private purchaseTotalGrandSubject = new BehaviorSubject<number>(0);
  private salesTotalPriceSubject = new BehaviorSubject<number>(0);
  private purchaseTotalPriceSubject = new BehaviorSubject<number>(0);
  private repairTotalPriceSubject = new BehaviorSubject<number>(0);
  private repairTotalGrandSubject = new BehaviorSubject<number>(0);
  private goldReceiptTotalPriceSubject = new BehaviorSubject<number>(0);
  private goldReceiptTotalGrandSubject = new BehaviorSubject<number>(0);
  private returnTotalPriceSubject = new BehaviorSubject<number>(0);
  private returnTotalGrandSubject = new BehaviorSubject<number>(0);
  private silverTotalPriceSubject = new BehaviorSubject<number>(0);
  private silverTotalGrandSubject = new BehaviorSubject<number>(0);
  private diamondTotalPriceSubject = new BehaviorSubject<number>(0);
  private diamondTotalGrandSubject = new BehaviorSubject<number>(0);
  private goldReceiptTotalTaxSubject = new BehaviorSubject<number>(0);
  private repairTotalTaxSubject = new BehaviorSubject<number>(0);
  private returnTotalTaxSubject = new BehaviorSubject<number>(0);
  private salesTotalTaxSubject = new BehaviorSubject<number>(0);
  private silverTotalTaxSubject = new BehaviorSubject<number>(0);
  private diamondTotalTaxSubject = new BehaviorSubject<number>(0);

  // Observables
  goldPrice$ = this.goldPriceSubject.asObservable();
  metalValue$ = this.metalValueSubject.asObservable();
  totalPrice$ = this.totalPriceSubject.asObservable();
  discountAmount$ = this.discountAmountSubject.asObservable();
  diamondDiscountAmount$ = this.diamondDiscountAmountSubject.asObservable();
  salesDiscountAmount$ = this.salesDiscountAmountSubject.asObservable();
  silverDiscountAmount$ = this.silverDiscountAmountSubject.asObservable();
  returnDiscountAmount$ = this.returnDiscountAmountSubject.asObservable();
  grandTotalWithVat$ = this.grandTotalWithVatSubject.asObservable();
  vat$ = this.vatValue.asObservable();
  salesTotalGrand$ = this.salesTotalGrandSubject.asObservable();
  purchaseTotalGrand$ = this.purchaseTotalGrandSubject.asObservable();
  salesTotalPrice$ = this.salesTotalPriceSubject.asObservable();
  purchaseTotalPrice$ = this.purchaseTotalPriceSubject.asObservable();
  repairTotalGrand$ = this.repairTotalGrandSubject.asObservable();
  repairTotalPrice$ = this.repairTotalPriceSubject.asObservable();
  goldReceiptTotalGrand$ = this.goldReceiptTotalGrandSubject.asObservable();
  goldReceiptTotalPrice$ = this.goldReceiptTotalPriceSubject.asObservable();
  returnTotalGrand$ = this.returnTotalGrandSubject.asObservable();
  returnTotalPrice$ = this.returnTotalPriceSubject.asObservable();
  silverTotalGrand$ = this.silverTotalGrandSubject.asObservable();
  silverTotalPrice$ = this.silverTotalPriceSubject.asObservable();
  diamondTotalGrand$ = this.diamondTotalGrandSubject.asObservable();
  diamondTotalPrice$ = this.diamondTotalPriceSubject.asObservable();
  goldReceiptTotalTax$ = this.goldReceiptTotalTaxSubject.asObservable();
  repairTotalTax$ = this.repairTotalTaxSubject.asObservable();
  returnTotalTax$ = this.returnTotalTaxSubject.asObservable();
  salesTotalTax$ = this.salesTotalTaxSubject.asObservable();
  silverTotalTax$ = this.silverTotalTaxSubject.asObservable();
  diamondTotalTax$ = this.diamondTotalTaxSubject.asObservable();

  constructor() {
    combineLatest([
      this.salesTotalPrice$,
      this.purchaseTotalPrice$,
      this.repairTotalPrice$,
      this.goldReceiptTotalPrice$,
      this.returnTotalPrice$,
      this.silverTotalPrice$,
      this.diamondTotalPrice$,
    ]).subscribe(([sales, purchase, repair, goldReceipt, ret, silver, diamond]) => {
      const positiveTotal = sales + repair + goldReceipt + silver + diamond;
      let totalPrice = positiveTotal - purchase - ret;

      if (positiveTotal === 0 && (purchase > 0 || ret > 0)) {
        totalPrice = -Math.abs(purchase + ret); // Only return or purchase exists
      }

      this.totalPriceSubject.next(+(+totalPrice * this.selectedCurrencyExchangeRate).toFixed(this.selectedCurrencyDecimalPlaces));
    });

    // Total price (including repair)
    combineLatest([
      this.salesTotalTax$,
      this.goldReceiptTotalTax$,
      this.repairTotalTax$,
      this.silverTotalTax$,
      this.diamondTotalTax$,
      this.returnTotalTax$,
    ]).subscribe(([salesTotalTax, repairTotalTax, goldReceiptTotalTax, silverTotalTax, diamondTotalTax, returnTotalTax]) => {
      const totalVat = (salesTotalTax + repairTotalTax + goldReceiptTotalTax + silverTotalTax + diamondTotalTax) - returnTotalTax;
      this.vatValue.next(+(+totalVat * this.selectedCurrencyExchangeRate).toFixed(this.selectedCurrencyDecimalPlaces));
    });

    combineLatest([
      this.salesTotalGrand$,
      this.purchaseTotalGrand$,
      this.repairTotalGrand$,
      this.goldReceiptTotalGrand$,
      this.returnTotalGrand$,
      this.silverTotalGrand$,
      this.diamondTotalGrand$,
    ]).subscribe(([sales, purchase, repair, goldReceipt, ret, silver, diamond]) => {
      const positiveTotal = sales + repair + goldReceipt + silver + diamond;
      let grandTotal = positiveTotal - purchase - ret;

      if (positiveTotal === 0 && (purchase > 0 || ret > 0)) {
        grandTotal = -Math.abs(purchase + ret); // Only return or purchase exists
      }

      this.grandTotalWithVatSubject.next(+(+grandTotal * this.selectedCurrencyExchangeRate).toFixed(this.selectedCurrencyDecimalPlaces));
    });

    combineLatest([
      this.salesDiscountAmount$,
      this.diamondDiscountAmount$,
      this.silverDiscountAmount$,
      this.returnDiscountAmount$
    ])
      .subscribe(([salesDiscount, diamondDiscount, silverDiscount, returnDiscount]) => {
        const totalDiscount = +salesDiscount + +diamondDiscount + +silverDiscount - +returnDiscount;
        this.discountAmountSubject.next(+(+totalDiscount * this.selectedCurrencyExchangeRate).toFixed(this.selectedCurrencyDecimalPlaces));
      });
  }

  notifyOrderPlaced() {
    this.orderPlacedSource.next();
  }

  notifyReturnsOrderPlaced() {
    this.returnOrderPlacedSource.next();
  }

  // Setters
  setGoldPrice(price: number): void {
    this.goldPriceSubject.next(price);
  }

  setMetalValue(value: number): void {
    this.metalValueSubject.next(value);
  }

  setTotalPrice(price: number): void {
    this.totalPriceSubject.next(price);
  }

  setTotalDiscountAmount(value: number): void {
    this.discountAmountSubject.next(+(+value * this.selectedCurrencyExchangeRate).toFixed(this.selectedCurrencyDecimalPlaces));
  }

  setDiamondDiscountAmount(value: number): void {
    this.diamondDiscountAmountSubject.next(+(+value * this.selectedCurrencyExchangeRate).toFixed(this.selectedCurrencyDecimalPlaces));
  }

  setSalesDiscountAmount(value: number): void {
    this.salesDiscountAmountSubject.next(+(+value * this.selectedCurrencyExchangeRate).toFixed(this.selectedCurrencyDecimalPlaces));
  }

  setReturnDiscountAmount(value: number): void {
    this.returnDiscountAmountSubject.next(+(+value * this.selectedCurrencyExchangeRate).toFixed(this.selectedCurrencyDecimalPlaces));
  }

  setSilverDiscountAmount(value: number): void {
    this.silverDiscountAmountSubject.next(+(+value * this.selectedCurrencyExchangeRate).toFixed(this.selectedCurrencyDecimalPlaces));
  }

  setGrandTotalWithVat(value: number): void {
    this.grandTotalWithVatSubject.next(value);
  }

  setSelectedCurrency(currency: Currency | null) {
    this.currencySource.next(currency);
  }

  setSelectedCustomer(customer: Customer | null) {
    this.customerSource.next(customer);
  }

  setVat(vat: any) {
    this.vatValue.next(vat);
  }

  setSalesTotalGrand(total: number) {
    this.salesTotalGrandSubject.next(total);
  }

  setPurchaseTotalGrand(total: number) {
    this.purchaseTotalGrandSubject.next(total);
  }

  setSalesTotalPrice(total: number) {
    this.salesTotalPriceSubject.next(total);
  }

  setRepairTotalGrand(total: number) {
    this.repairTotalGrandSubject.next(total);
  }

  setRepairTotalPrice(total: number) {
    this.repairTotalPriceSubject.next(total);
  }

  setGoldReceiptTotalGrand(total: number) {
    this.goldReceiptTotalGrandSubject.next(total);
  }

  setGoldReceiptTotalPrice(total: number) {
    this.goldReceiptTotalPriceSubject.next(total);
  }

  setReturnTotalGrand(total: number) {
    this.returnTotalGrandSubject.next(total);
  }

  setReturnTotalPrice(total: number) {
    this.returnTotalPriceSubject.next(total);
  }

  setSilverTotalGrand(total: number) {
    this.silverTotalGrandSubject.next(total);
  }

  setSilverTotalPrice(total: number) {
    this.silverTotalPriceSubject.next(total);
  }

  setDiamondTotalGrand(total: number) {
    this.diamondTotalGrandSubject.next(total);
  }

  setDiamondTotalPrice(total: number) {
    this.diamondTotalPriceSubject.next(total);
  }

  setPurchaseTotalPrice(total: number) {
    this.purchaseTotalPriceSubject.next(total);
  }

  setGoldReceiptTotalTax(total: number) {
    this.goldReceiptTotalTaxSubject.next(total);
  }

  setRepairTotalTax(total: number) {
    this.repairTotalTaxSubject.next(total);
  }

  setReturnTotalTax(total: number) {
    this.returnTotalTaxSubject.next(total);
  }

  setSalesTax(total: number) {
    this.salesTotalTaxSubject.next(total);
  }

  setSilverTax(total: number) {
    this.silverTotalTaxSubject.next(total);
  }

  setDiamondTax(total: number) {
    this.diamondTotalTaxSubject.next(total);
  }

  triggerRefreshCurrency() {
    this.refreshCurrencySource.next();
  }

  get selectedCurrencyDecimalPlaces() {
    return +(this.currencySource.value?.currency_decimal_point ?? 3);
  }

  get selectedCurrencyExchangeRate() {
    return +(this.currencySource.value?.exchange_rate ?? 1.000);
  }

  resetAllValues() {
    // Reset all price-related values to 0
    this.goldPriceSubject.next(0);
    this.metalValueSubject.next(0);
    this.totalPriceSubject.next(0);
    this.discountAmountSubject.next(0);
    this.grandTotalWithVatSubject.next(0);
    this.vatValue.next(0);
    this.salesTotalGrandSubject.next(0);
    this.purchaseTotalGrandSubject.next(0);
    this.salesTotalPriceSubject.next(0);
    this.purchaseTotalPriceSubject.next(0);
    this.repairTotalPriceSubject.next(0);
    this.repairTotalGrandSubject.next(0);
    this.goldReceiptTotalPriceSubject.next(0);
    this.goldReceiptTotalGrandSubject.next(0);
    this.returnTotalPriceSubject.next(0);
    this.returnTotalGrandSubject.next(0);
    this.silverTotalPriceSubject.next(0);
    this.silverTotalGrandSubject.next(0);
    this.diamondTotalPriceSubject.next(0);
    this.diamondTotalGrandSubject.next(0);
    this.goldReceiptTotalTaxSubject.next(0);
    this.repairTotalTaxSubject.next(0);
    this.returnTotalTaxSubject.next(0);
    this.salesTotalTaxSubject.next(0);
    this.silverTotalTaxSubject.next(0);
    this.diamondTotalTaxSubject.next(0);
  }
}
