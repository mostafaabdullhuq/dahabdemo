import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PosPurchaseService {
   constructor(private _http: SingletonService) { }
  
addPurchaseProduct(form:any): Observable<any>{
    return this._http.postRequest(`${environment.api_url}pos/order-product/purchase/`,form);
  }

  getPurchaseProduct(): Observable<any>{
    return this._http.getRequest(`${environment.api_url}pos/order-product-receipt/purchase/`);
  }

  
}
