import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { PosService } from './pos.service';
import { PosSharedService } from './pos-shared.service';

@Injectable({
  providedIn: 'root'
})
export class PosSalesService {
  private posSalesProductsOrdersReciepts = new BehaviorSubject<any>(false);
  private shiftDataSubject = new BehaviorSubject<any>(null);
  shiftData$ = this.shiftDataSubject.asObservable();
  selectedCurrency: any = ''
  get shiftData() {
    return this.shiftDataSubject.value;
  } constructor(private _posService: PosService, private _posSharedService: PosSharedService) {
    this.getProductSaleOrdersRecipts();
    this._posSharedService.selectedCurrency$
      .pipe(take(1)) // or takeUntil(...) if you expect changes
      .subscribe(currency => {
        this.selectedCurrency = currency;
      });
  }


  getProductSaleOrdersRecipts(): void {
    this._posService.getProductSaleOrdersRecipts().subscribe({
      next: (res: any) => {
        this.posSalesProductsOrdersReciepts.next(res);
      },
      error: () => {
        this.posSalesProductsOrdersReciepts.next([])
      }
    });
  }
  _salesReciepts$ = new BehaviorSubject<any[]>([]);

  getSalesOrdersFromServer() {
    this._posService.getProductSaleOrdersRecipts().subscribe(res => {
      this._salesReciepts$.next(res || []);
    });
  }
  
}
