import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { SingletonService } from '../../../core/services/singleton.service';

@Injectable({
  providedIn: 'root'
})
export class PosDiamondService {
  constructor(private _http: SingletonService) { 
    this.fetchDiamondOrders()
  }
    private diamondOrdersSubject = new BehaviorSubject<any[]>([]);
  returnOrders$ = this.diamondOrdersSubject.asObservable();

  getTableDiamondOrder(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/order-product-receipt/diamond/`);

  }

  getSilverProducts(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/product-diamond/`);
  }
  
  fetchDiamondOrders(): void {
    this._http.getRequest(`${environment.api_url}pos/order-product-receipt/diamond/`).subscribe({
      next: (res: any) => {
        this.diamondOrdersSubject.next(res || []);
      },
      error: () => {
        this.diamondOrdersSubject.next([]);
      }
    });
  }
  addProductDiamond(form:any): Observable<any>{
    return this._http.postRequest(`${environment.api_url}pos/order-product/diamond/`, form);
  }
  // Optional getter for direct access
  get currentDiamondOrders(): any[] {
    return this.diamondOrdersSubject.value;
  }
}
