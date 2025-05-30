import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PosService {
 constructor(private _http: SingletonService) { }
 addShift(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}pos/shift-register/`,addForm);
  }
  closeShift(id:any): Observable<any> {
  return this._http.patchRequest(`${environment.api_url}pos/shift-closing/${id}/`);
}
  shiftStatus(): Observable<any>{
    return this._http.getRequest(`${environment.api_url}pos/shift-status/`);
  }
  getCurrenciesByBranchId(branchId:any): Observable<any>{
    return this._http.getRequest(`${environment.api_url}branch/currencies/${branchId}/`);
  }
  // getSalesProducts(): Observable<any>{
  //   return this._http.getRequest(`${environment.api_url}pos/product-sale/`);
  // }
  addProductSale(form:any): Observable<any>{
    return this._http.postRequest(`${environment.api_url}pos/order-product/sale/`, form);
  }
  deleteProductPos(id:any): Observable<any>{
    return this._http.deleteRequest(`${environment.api_url}pos/order-product/${id}/`);
  }
  setDiscountProductSale(id:any , form:any): Observable<any>{
    return this._http.patchRequest(`${environment.api_url}pos/order-product-discount/${id}/`, form);
  }
  getProductSaleOrdersRecipts(): Observable<any>{
    return this._http.getRequest(`${environment.api_url}pos/order-product-receipt/sale/`);
  }
  getProductSalesList(minimal:boolean = true ,page:any =1 , pageSize=1000000): Observable<any>{
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}pos/product-sale/?${param}`);
  }
  getGoldPrice(bId:any): Observable<any>{
    return this._http.getRequest(`${environment.api_url}branch/gold-price/${bId}/`);
  }
  getPaymentMethods(): Observable<any>{
    return this._http.getRequest(`${environment.api_url}pos/payment-method/`);
  }
  getOrderId():Observable<any>{
    return this._http.getRequest(`${environment.api_url}pos/order-id/`);
  }
  addOrder(id:any, form:FormGroup):Observable<any>{
    return this._http.patchRequest(`${environment.api_url}pos/order-payment/${id}/` , form);
  }

  getOrderInvoice():Observable<any>{
    return this._http.getRequest(`${environment.api_url}pos/order-tax-invoice/`);
  }
}
