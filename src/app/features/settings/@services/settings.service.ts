import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(private _http: SingletonService) { }

  //-----> Businesss API
  addBusiness(addForm: FormGroup | FormData): Observable<any> {
    return this._http.postRequest(`${environment.api_url}business/settings/business/`, addForm);
  }

  getBusinessById(id: number | string) {
    return this._http.getRequest(`${environment.api_url}superadmin/all-businesses/${id}/`);
  }

  updateBusiness(id: number | string, editForm: FormGroup | FormData) {
    return this._http.patchRequest(`${environment.api_url}business/settings/business/${id}/`, editForm);
  }

  deleteBusiness(id: number) {
    return this._http.deleteRequest(`${environment.api_url}business/settings/business/${id}/`);
  }

  getCustomFields(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}business/settings/business-custom-fields/`);
  }

  updateCustomFields(form: any): Observable<any> {
    return this._http.patchRequest(`${environment.api_url}business/settings/business-custom-fields/`, form);
  }

  getBranchCustomLabel() {
    return this._http.getRequest(`${environment.api_url}branch/custom-field-label/`);
  }

  addBranch(addForm: FormGroup | FormData): Observable<any> {
    return this._http.postRequest(`${environment.api_url}branch/`, addForm);
  }

  getBranchById(id: any): Observable<any> {
    return this._http.getRequest(`${environment.api_url}branch/${id}/`);
  }

  updateBranch(id: any, addForm: FormGroup | FormData): Observable<any> {
    return this._http.patchRequest(`${environment.api_url}branch/${id}/`, addForm);
  }

  deleteBranch(id: number) {
    return this._http.deleteRequest(`${environment.api_url}branch/${id}/`);
  }

  getBranches(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}branch/${params}/`);
  }

  addTaxRate(addForm: FormGroup | FormData): Observable<any> {
    return this._http.postRequest(`${environment.api_url}business/settings/tax-rates/`, addForm);
  }

  getTaxRateById(id: any): Observable<any> {
    return this._http.getRequest(`${environment.api_url}business/settings/tax-rates/${id}/`);
  }

  updateTaxRate(id: any, addForm: FormGroup | FormData): Observable<any> {
    return this._http.patchRequest(`${environment.api_url}business/settings/tax-rates/${id}/`, addForm);
  }

  deleteTaxRate(id: number) {
    return this._http.deleteRequest(`${environment.api_url}business/settings/tax-rates/${id}/`);
  }

  getTaxRatees(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}business/settings/tax-rates/${params}/`);
  }

  addPaymentOption(addForm: FormGroup | FormData): Observable<any> {
    return this._http.postRequest(`${environment.api_url}business/settings/payment-methods/`, addForm);
  }

  getPaymentOptionById(id: any): Observable<any> {
    return this._http.getRequest(`${environment.api_url}business/settings/payment-methods/${id}/`);
  }

  updatePaymentOption(id: any, addForm: FormGroup | FormData): Observable<any> {
    return this._http.patchRequest(`${environment.api_url}business/settings/payment-methods/${id}/`, addForm);
  }

  deletePaymentOption(id: number) {
    return this._http.deleteRequest(`${environment.api_url}business/settings/payment-methods/${id}/`);
  }

  getPaymentOptions(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}business/settings/payment-methods/${params}/`);
  }


  addCurrency(addForm: FormGroup | FormData): Observable<any> {
    return this._http.postRequest(`${environment.api_url}business/settings/currencies/`, addForm);
  }

  getCurrencyById(id: any): Observable<any> {
    return this._http.getRequest(`${environment.api_url}business/settings/currencies/${id}/`);
  }

  updateCurrency(id: any, addForm: FormGroup | FormData): Observable<any> {
    return this._http.patchRequest(`${environment.api_url}business/settings/currencies/${id}/`, addForm);
  }

  deleteCurrency(id: number) {
    return this._http.deleteRequest(`${environment.api_url}business/settings/currencies/${id}/`);
  }

  getCurrencies(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}business/settings/currencies${params}/`);
  }

  getInvoiceLayouts(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    return this._http.getRequest(`${environment.api_url}business/settings/invoice-layout/`);
  }

  updateInvoiceLayout(id: any, addForm: FormGroup | FormData): Observable<any> {
    return this._http.patchRequest(`${environment.api_url}business/settings/invoice-layout/${id}/`, addForm);
  }

  addInvoiceLayout(addForm: FormGroup | FormData): Observable<any> {
    return this._http.postRequest(`${environment.api_url}business/settings/invoice-layout/`, addForm);
  }

  deleteInvoiceLayout(id: number) {
    return this._http.deleteRequest(`${environment.api_url}business/settings/invoice-layout/${id}/`);
  }
}
