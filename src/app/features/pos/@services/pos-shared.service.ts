import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PosSharedService {
  private currencySource = new BehaviorSubject<any>(null);
  selectedCurrency$ = this.currencySource.asObservable();

  // Prices
  private goldPriceSubject = new BehaviorSubject<number>(0);
  private metalValueSubject = new BehaviorSubject<number>(0);
  private totalPriceSubject = new BehaviorSubject<number>(0);
  private discountAmountSubject = new BehaviorSubject<number>(0);
  private grandTotalWithVatSubject = new BehaviorSubject<number>(0);
  private vatValue = new BehaviorSubject<number>(0);
  // Observables to subscribe to in the components
  goldPrice$ = this.goldPriceSubject.asObservable();
  metalValue$ = this.metalValueSubject.asObservable();
  totalPrice$ = this.totalPriceSubject.asObservable();
  discountAmount$ = this.discountAmountSubject.asObservable();
  grandTotalWithVat$ = this.grandTotalWithVatSubject.asObservable();
  vat$ = this.vatValue.asObservable();



  // Methods to update the calculated values
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
}
