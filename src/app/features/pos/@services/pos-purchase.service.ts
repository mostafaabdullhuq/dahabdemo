import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { environment } from '../../../../environments/environment.development';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PosPurchaseService {
  private purchaseProductsSubject = new BehaviorSubject<any[]>([]);
  purchaseProducts$ = this.purchaseProductsSubject.asObservable();

  constructor(private _http: SingletonService) {
    this.fetchPurchaseProducts(); // optionally load on service init
  }

addPurchaseProduct(form: any): Observable<any> {
  return this._http.postRequest(`${environment.api_url}pos/order-product/purchase/`, form).pipe(
    tap(() => this.fetchPurchaseProducts())
  );
}

  fetchPurchaseProducts(): void {
    this._http.getRequest(`${environment.api_url}pos/order-product-receipt/purchase/`).subscribe({
      next: (res: any) => {
        this.purchaseProductsSubject.next(res || []);
      },
      error: () => {
        this.purchaseProductsSubject.next([]);
      }
    });
  }

  get currentPurchaseProducts(): any[] {
    return this.purchaseProductsSubject.value;
  }
}
