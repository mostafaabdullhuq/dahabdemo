import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { environment } from '../../../../environments/environment.development';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PosGoldReceiptService {
  private goldReceiptProductsSubject = new BehaviorSubject<any[]>([]);
  goldReceiptProducts$ = this.goldReceiptProductsSubject.asObservable();

  constructor(private _http: SingletonService) {
    this.fetchGoldReceiptProducts(); // Optionally fetch on service init
  }

  addGoldReceiptProduct(form: any): Observable<any> {
    return this._http.postRequest(`${environment.api_url}pos/order-product/gold-receipt/`, form).pipe(
      tap(() => this.fetchGoldReceiptProducts())
    );
  }

  fetchGoldReceiptProducts(): void {
    this._http.getRequest(`${environment.api_url}pos/order-product-receipt/gold-receipt/`).subscribe({
      next: (res: any) => {
        this.goldReceiptProductsSubject.next(res || []);
      },
      error: () => {
        this.goldReceiptProductsSubject.next([]);
      }
    });
  }

  get currentGoldReceiptProducts(): any[] {
    return this.goldReceiptProductsSubject.value;
  }
}
