import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PosReturnsService {
   constructor(private _http: SingletonService) { }
  
getReturnReciepts(): Observable<any>{
    return this._http.getRequest(`${environment.api_url}pos/order-product-receipt/return/`);
  }

  getReturnProducts(): Observable<any>{
    return this._http.getRequest(`${environment.api_url}pos/product-return/`);
  }
}
