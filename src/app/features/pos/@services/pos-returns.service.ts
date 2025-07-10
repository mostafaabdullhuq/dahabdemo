import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { PosSharedService } from './pos-shared.service';

@Injectable({
  providedIn: 'root'
})
export class PosReturnsService {
  constructor(private _http: SingletonService, private _posSharedService: PosSharedService) {
    this.fetchReturnOrders()
  }
  private returnOrdersSubject = new BehaviorSubject<any[]>([]);
  returnOrders$ = this.returnOrdersSubject.asObservable();

  getTableReturnOrder(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/order-product-receipt/return/`);

  }
  getReturnReciepts(params?: string): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/customer-orders/?${params}`);
  }

  getReturnProducts(params?: string): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/product-return/?${params}`);
  }
  addProductReturn(form: any): Observable<any> {
    return this._http.postRequest(`${environment.api_url}pos/order-product/return/`, form);
  }
  fetchReturnOrders(): void {
    this._http.getRequest(`${environment.api_url}pos/order-product-receipt/return/`).subscribe({
      next: (res: any) => {
        this.returnOrdersSubject.next(res || []);

        if (this.returnOrdersSubject?.value?.length === 0) {
          this._posSharedService.setReturnTotalTax(0);
          this._posSharedService.setReturnTotalGrand(0);
          this._posSharedService.setReturnTotalPrice(0);
        }
      },
      error: () => {
        this.returnOrdersSubject.next([]);
      }
    });
  }
  private receiptsSubject = new BehaviorSubject<any[]>([]);
  receipts$ = this.receiptsSubject.asObservable();
  refetchReceiptsProducts(customerId: any): void {
    let params = "";
    if (customerId) {
      params = `customer_id=${customerId}`;
    }

    this.getReturnReciepts(params).subscribe((res) => {
      this.receiptsSubject.next(res?.results || []);
    });
  }

  // Optional getter for direct access
  get currentReturnOrders(): any[] {
    return this.returnOrdersSubject.value;
  }
}
