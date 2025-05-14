import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PosGoldReceiptService {
   constructor(private _http: SingletonService) { }
  
addGoldReceiptProduct(form:any): Observable<any>{
    return this._http.postRequest(`${environment.api_url}pos/order-product/gold-receipt/`,form);
  }

  getGoldReceiptProduct(): Observable<any>{
    return this._http.getRequest(`${environment.api_url}pos/order-product-receipt/gold-receipt/`);
  }
}
