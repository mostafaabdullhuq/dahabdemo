import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment.development';
import { CurrencyResponse, Customer, PaymentMethodResponse, ShiftData } from '../interfaces/pos.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PosService {
  constructor(private _http: SingletonService) { }
  addShift(addForm: FormGroup | FormData): Observable<any> {
    return this._http.postRequest(`${environment.api_url}pos/shift-register/`, addForm);
  }
  closeShift(id: any): Observable<any> {
    return this._http.patchRequest(`${environment.api_url}pos/shift-closing/${id}/`);
  }
  shiftStatus(): Observable<ShiftData> {
    return this._http.getRequest(`${environment.api_url}pos/shift-status/`);
  }
  getCurrenciesByBranchId(branchId: number | string): Observable<CurrencyResponse> {
    return this._http.getRequest(`${environment.api_url}branch/currencies/${branchId}/`);
  }
  // getSalesProducts(): Observable<any>{
  //   return this._http.getRequest(`${environment.api_url}pos/product-sale/`);
  // }
  addProductSale(form: any): Observable<any> {
    return this._http.postRequest(`${environment.api_url}pos/order-product/sale/`, form);
  }
  deleteProductPos(id: any): Observable<any> {
    return this._http.deleteRequest(`${environment.api_url}pos/order-product/${id}/`);
  }

  deleteReturnProductPos(id: number, sold_product_id: number): Observable<any> {
    return this._http.deleteRequest(`${environment.api_url}pos/order-product/${id}/?orderproduct_id=${sold_product_id}`);
  }

  setDiscountProductSale(id: any, form: any): Observable<any> {
    return this._http.patchRequest(`${environment.api_url}pos/order-product-update/${id}/`, form);
  }

  updateOrderValues(id: any, form: any): Observable<any> {
    return this._http.patchRequest(`${environment.api_url}pos/order-product-update/${id}/`, form);
  }

  getProductSaleOrdersRecipts(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/order-product-receipt/sale/`);
  }
  getProductSalesList(minimal: boolean = false, page: any = 1, pageSize = 1000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}pos/product-sale/?${param}`);
  }

  getProductSilverList(minimal: boolean = false, page: any = 1, pageSize = 1000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}pos/product-silver/?${param}`);
  }

  getProductDiamondList(minimal: boolean = false, page: any = 1, pageSize = 1000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}pos/product-diamond/?${param}`);
  }


  getGoldPrice(bId: any): Observable<any> {
    return this._http.getRequest(`${environment.api_url}branch/gold-price/${bId}/`);
  }
  getPaymentMethods(): Observable<PaymentMethodResponse> {
    return this._http.getRequest(`${environment.api_url}pos/payment-method/`);
  }
  getOrderId(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/order-id/`);
  }
  addOrder(id: any, form: FormGroup): Observable<any> {
    return this._http.patchRequest(`${environment.api_url}pos/order-payment/${id}/`, form);
  }

  getOrderInvoice(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/order-tax-invoice/`);
  }

  getShiftReport(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}pos/shift-report/`);
  }

  getBranchTax(id: any): Observable<any> {
    return this._http.getRequest(`${environment.api_url}branch/tax/${id}/`)
  }

  getCustomerById(customerId: number) {
    return this._http.get<Customer>(`customer/${customerId}`)
  }


}
