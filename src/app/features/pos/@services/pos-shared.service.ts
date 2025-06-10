import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PosSharedService {
  private currencySource = new BehaviorSubject<any>(null);
  selectedCurrency$ = this.currencySource.asObservable();
private orderPlacedSource = new Subject<void>();
private returnOrderPlacedSource = new Subject<void>();
  orderPlaced$ = this.orderPlacedSource.asObservable();
  returnORrderPlaced$ = this.returnOrderPlacedSource.asObservable();
  notifyOrderPlaced() {
    this.orderPlacedSource.next();
  }
  notifyReturnsOrderPlaced() {
    this.returnOrderPlacedSource.next();
  }
  // Prices
  private goldPriceSubject = new BehaviorSubject<number>(0);
  private metalValueSubject = new BehaviorSubject<number>(0);
  private totalPriceSubject = new BehaviorSubject<number>(0);
  private discountAmountSubject = new BehaviorSubject<number>(0);
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
  private salesTotalTaxSubject = new BehaviorSubject<number>(0);
  private silverTotalTaxSubject = new BehaviorSubject<number>(0);
  private diamondTotalTaxSubject = new BehaviorSubject<number>(0);

  // Observables
  goldPrice$ = this.goldPriceSubject.asObservable();
  metalValue$ = this.metalValueSubject.asObservable();
  totalPrice$ = this.totalPriceSubject.asObservable();
  discountAmount$ = this.discountAmountSubject.asObservable();
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
  salesTotalTax$ = this.salesTotalTaxSubject.asObservable();
  silverTotalTax$ = this.silverTotalTaxSubject.asObservable();
  diamondTotalTax$ = this.diamondTotalTaxSubject.asObservable();

  constructor() {
    // Grand total (including repair)
    // combineLatest([
    //   this.salesTotalGrand$,
    //   this.purchaseTotalGrand$,
    //   this.repairTotalGrand$,
    //   this.goldReceiptTotalGrand$,
    //   this.returnTotalGrand$,
    //   this.silverTotalGrand$,
    //   this.diamondTotalGrand$,
    // ]).subscribe(([diamondTotalGrand,silverTotalGrand, salesTotal, purchaseTotal, repairTotal ,goldReceiptTotalGrand ,returnTotalGrand]) => {
    //   const grandTotal = (salesTotal + repairTotal + goldReceiptTotalGrand + silverTotalGrand + diamondTotalGrand) - purchaseTotal - returnTotalGrand;
    //   this.grandTotalWithVatSubject.next(grandTotal);
    // });
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

  this.grandTotalWithVatSubject.next(+grandTotal.toFixed(3));
});
    // Total price (including repair)
    // combineLatest([
    //   this.salesTotalPrice$,
    //   this.purchaseTotalPrice$,
    //   this.repairTotalPrice$,
    //   this.goldReceiptTotalPrice$,
    //   this.returnTotalPrice$,
    //   this.silverTotalPrice$,
    //   this.diamondTotalPrice$,
    // ]).subscribe(([diamondTotalPrice ,silverTotalPrice , salesTotalPrice, purchaseTotalPrice, repairTotalPrice , goldReceiptTotalPrice ,returnTotalPrice]) => {      
    //   const totalPrice = (salesTotalPrice  + repairTotalPrice + goldReceiptTotalPrice + silverTotalPrice + diamondTotalPrice) - purchaseTotalPrice - returnTotalPrice;
    //   this.totalPriceSubject.next(+totalPrice.toFixed(3));
    // });
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

  this.totalPriceSubject.next(+totalPrice.toFixed(3));
});
    // Total price (including repair)
    combineLatest([
      this.salesTotalTax$,
      this.goldReceiptTotalTax$,
      this.repairTotalTax$,
      this.silverTotalTax$,
      this.diamondTotalTax$
    ]).subscribe(([salesTotalTax, repairTotalTax, goldReceiptTotalTax , silverTotalTax ,diamondTotalTax]) => {      
      const totalVat = (salesTotalTax  + repairTotalTax + goldReceiptTotalTax + silverTotalTax + diamondTotalTax);
      this.vatValue.next(+totalVat.toFixed(3));
    });
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

  setDiscountAmount(value: number): void {
    this.discountAmountSubject.next(value);
  }

  setGrandTotalWithVat(value: number): void {
    this.grandTotalWithVatSubject.next(value);
  }

  setSelectedCurrency(currency: any) {
    this.currencySource.next(currency);
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
  setSalesTax(total: number) {
    this.salesTotalTaxSubject.next(total);
  }
  setSilverTax(total: number) {
    this.silverTotalTaxSubject.next(total);
  }
  setDiamondTax(total: number) {
    this.diamondTotalTaxSubject.next(total);
  }
}
