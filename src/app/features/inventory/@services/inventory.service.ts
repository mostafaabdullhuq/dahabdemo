import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  constructor(private _http: SingletonService) { }
  //-----> Products API
  // Get Products 
  getProducts(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    return this._http.getRequest(`${environment.api_url}Product`, params );
  }
  addProduct(addForm:FormGroup): Observable<any>{
    return this._http.postRequest(`${environment.api_url}Product/`,addForm);
  }
  getProductById(id:number | string){
    return this._http.getRequest(`${environment.api_url}Product/${id}`);
  }
  updateProduct(id:number | string, editForm:FormGroup){
    return this._http.putRequest(`${environment.api_url}Product/${id}` , editForm);
  }
  deleteProduct(id:number ){
    return this._http.deleteRequest(`${environment.api_url}Product/${id}`);
  }
}
