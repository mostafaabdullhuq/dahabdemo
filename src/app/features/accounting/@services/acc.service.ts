import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AccService {
  constructor(private _http: SingletonService) { }
  getGoldPrice(bId: any): Observable<any> {
    return this._http.getRequest(`${environment.api_url}branch/gold-price/${bId}/`);
  }

  //-----> acc API
  // Get acc 
  getTransactions(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}transactions/${params}`);
  }
  deleteTransaction(id: number) {
    return this._http.deleteRequest(`${environment.api_url}transactions/${id}`);
  }

  getPurchases(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}purchases/${params}`);
  }
  addPurchase(form: any) {
    return this._http.postRequest(`${environment.api_url}purchases/`, form);
  }
  deletePurchase(id: number) {
    return this._http.deleteRequest(`${environment.api_url}purchases/${id}`);
  }
  getBranchTax(id:any): Observable<any>{
    return this._http.getRequest(`${environment.api_url}branch/tax/${id}`);
  }
getBranchPaymentMethods(id:any){
    return this._http.getRequest(`${environment.api_url}branch/payment-method/${id}`);
  }
  getExpenses(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}expenses/expenses/${params}`);
  }
  getExpenseById(id: any) {
    return this._http.getRequest(`${environment.api_url}expenses/expenses/${id}/`);
  }
  addExpense(form: FormData | FormGroup) {
    return this._http.postRequest(`${environment.api_url}expenses/expenses/`, form);
  }
  updateExpense(id: number | string, editForm: FormGroup | FormData) {
    return this._http.patchRequest(`${environment.api_url}expenses/expenses/${id}/`, editForm);
  }
  deleteExpense(id: number) {
    return this._http.deleteRequest(`${environment.api_url}expenses/expenses/${id}/`);
  }
addExpensePayment(id: number| string , form: FormData | FormGroup) {
    return this._http.postRequest(`${environment.api_url}expenses/expenses/${id}/payments/`, form);
  }

  getExpenseCategories(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}expenses/category/${params}`);
  }
  addExpenseCategory(form: FormData | FormGroup) {
    return this._http.postRequest(`${environment.api_url}expenses/category/`, form);
  }
  updateExpenseCategory(id: number | string, editForm: FormGroup | FormData) {
    return this._http.patchRequest(`${environment.api_url}expenses/category/${id}/`, editForm);
  }
  getExpenseCategoryById(id:number | string){
    return this._http.getRequest(`${environment.api_url}expenses/category/${id}`);
  }
  deleteExpenseCategory(id: number) {
    return this._http.deleteRequest(`${environment.api_url}expenses/category/${id}/`);
  }

    getChartOfAcc(search:string): Observable<any> {
    const params = `?${search}`
    return this._http.getRequest(`${environment.api_url}accounting/accounts/${params}`);
  }

  addPurchasePayment(form:any) {
    return this._http.postRequest(`${environment.api_url}purchases/payment/`, form);
  }
}
