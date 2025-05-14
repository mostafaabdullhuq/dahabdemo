import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccService {
  constructor(private _http: SingletonService) { }
  //-----> acc API
  // Get acc 
  getTransactions(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}transactions/${params}` );
  }
    deleteTransaction(id:number ){
    return this._http.deleteRequest(`${environment.api_url}transactions/${id}`);
  }

   getPurchases(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}purchases/${params}` );
  }
    deletePurchase(id:number ){
    return this._http.deleteRequest(`${environment.api_url}purchases/${id}`);
  }
}
