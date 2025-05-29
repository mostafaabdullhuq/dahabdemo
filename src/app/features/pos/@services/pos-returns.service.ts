import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PosReturnsService {
  constructor(private _http: SingletonService) { 
    this.fetchReturnOrders()
  }
    private returnOrdersSubject = new BehaviorSubject<any[]>([]);
  returnOrders$ = this.returnOrdersSubject.asObservable();

  getTableReturnOrder(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/order-product-receipt/return/`);

  }
  getReturnReciepts(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/customer-orders/`);
  }

  getReturnProducts(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/product-return/`);
  }
  
  fetchReturnOrders(): void {
    this._http.getRequest(`${environment.api_url}pos/order-product-receipt/return/`).subscribe({
      next: (res: any) => {
        this.returnOrdersSubject.next(res || []);
      },
      error: () => {
        this.returnOrdersSubject.next([]);
      }
    });
  }

  // Optional getter for direct access
  get currentReturnOrders(): any[] {
    return this.returnOrdersSubject.value;
  }
}
