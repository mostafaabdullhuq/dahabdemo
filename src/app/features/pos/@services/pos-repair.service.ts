import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PosRepairService {
   constructor(private _http: SingletonService) { }
  
addRepairProduct(form:any): Observable<any>{
    return this._http.postRequest(`${environment.api_url}pos/order-product/repair/`,form);
  }

  getRepairProduct(): Observable<any>{
    return this._http.getRequest(`${environment.api_url}pos/order-product-receipt/repair/`);
  }
}
