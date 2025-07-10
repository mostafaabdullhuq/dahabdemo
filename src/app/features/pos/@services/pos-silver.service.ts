import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PosSilverService {
  constructor(private _http: SingletonService) {
    this.fetchSilverOrders()
  }
  private silverOrdersSubject = new BehaviorSubject<any[]>([]);
  silverOrders$ = this.silverOrdersSubject.asObservable();

  getTableSilverOrder(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/order-product-receipt/silver/`);

  }

  getSilverProducts(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/product-silver/`);
  }

  fetchSilverOrders(): void {
    this._http.getRequest(`${environment.api_url}pos/order-product-receipt/silver/`).subscribe({
      next: (res: any) => {
        this.silverOrdersSubject.next(res || []);
      },
      error: () => {
        this.silverOrdersSubject.next([]);
      }
    });
  }
  addProductSilver(form: any): Observable<any> {
    return this._http.postRequest(`${environment.api_url}pos/order-product/silver/`, form);
  }
  // Optional getter for direct access
  get currentSilverOrders(): any[] {
    return this.silverOrdersSubject.value;
  }
}
