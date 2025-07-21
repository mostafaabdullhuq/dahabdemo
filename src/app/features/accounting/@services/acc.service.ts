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

  getTransactions(search: any = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}transactions/${params}`);
  }

  getMinimalBranchTransactions(branchId: number, pageSize: number = 100000000): Observable<any> {
    const params = `?minimal=true&shift__branch=${branchId}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}transactions/${params}`);
  }

  getTransactionById(id: number | string) {
    return this._http.getRequest(`${environment.api_url}transactions/${id}/`);
  }

  updateTransaction(id: number | string, editForm: FormGroup | FormData) {
    return this._http.patchRequest(`${environment.api_url}transactions/${id}/`, editForm);
  }

  restoreTransaction(id: number | string, editForm: FormGroup | FormData) {
    return this._http.patchRequest(`${environment.api_url}transactions/restore/${id}/`, editForm);
  }

  addPaymentTransaction(id: any, form: any) {
    return this._http.postRequest(`${environment.api_url}transactions/payment/${id}/`, form);
  }

  deletePurchasePayment(paymentId: number) {
    return this._http.delete(`purchases/payment/${paymentId}/`)
  }

  deleteTransaction(id: number) {
    return this._http.deleteRequest(`${environment.api_url}transactions/${id}/`);
  }

  getDeletedTransactions(search: any = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}transactions/deleted/${params}`);
  }

  getPurchases(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}purchases/${params}`);
  }

  getMinimalBranchPurchases(branchId: number, pageSize: number = 100000000): Observable<any> {
    const params = `?minimal=true&branch=${branchId}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}purchases/${params}`);
  }

  addPurchase(form: any) {
    return this._http.postRequest(`${environment.api_url}purchases/`, form);
  }

  updatePurchase(id: number | string, editForm: FormGroup | FormData) {
    return this._http.patchRequest(`${environment.api_url}purchases/${id}/`, editForm);
  }

  getPurchaseById(id: number | string) {
    return this._http.getRequest(`${environment.api_url}purchases/${id}/`);
  }

  deletePurchase(id: number) {
    return this._http.deleteRequest(`${environment.api_url}purchases/delete/${id}/`);
  }

  getBranchTax(id: any): Observable<any> {
    return this._http.getRequest(`${environment.api_url}branch/tax/${id}`);
  }

  getBranchPaymentMethods(id: any): Observable<any[]> {
    return this._http.getRequest(`${environment.api_url}branch/payment-method/${id}`);
  }

  getExpenses(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
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

  addExpensePayment(id: number | string, form: FormData | FormGroup) {
    return this._http.postRequest(`${environment.api_url}expenses/expenses/${id}/payments/`, form);
  }

  getExpenseCategories(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}expenses/category/${params}`);
  }

  getExpenseSubCategories(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}expenses/category/subcategories/${params}`);
  }

  addExpenseCategory(form: FormData | FormGroup) {
    return this._http.postRequest(`${environment.api_url}expenses/category/all/`, form);
  }

  updateExpenseCategory(id: number | string, editForm: FormGroup | FormData) {
    return this._http.patchRequest(`${environment.api_url}expenses/category/${id}/`, editForm);
  }

  getExpenseCategoryById(id: number | string) {
    return this._http.getRequest(`${environment.api_url}expenses/category/${id}`);
  }

  deleteExpenseCategory(id: number) {
    return this._http.deleteRequest(`${environment.api_url}expenses/category/${id}/`);
  }

  getChartOfAcc(search: string): Observable<any> {
    const params = `?${search}`
    return this._http.getRequest(`${environment.api_url}accounting/accounts/${params}`);
  }

  addPurchasePayment(form: any) {
    return this._http.postRequest(`${environment.api_url}purchases/payment/`, form);
  }

  addJournalEntry(form: any) {
    return this._http.postRequest(`${environment.api_url}accounting/`, form);
  }

  updateJournalEntry(id: number | string, editForm: any) {
    return this._http.patchRequest(`${environment.api_url}accounting/${id}/`, editForm);
  }

  getJournalEntry(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}accounting/${params}`);
  }

  getJournalEntryById(id: number | string) {
    return this._http.getRequest(`${environment.api_url}accounting/${id}`);
  }

  deleteJournalEntry(id: number) {
    return this._http.deleteRequest(`${environment.api_url}accounting/${id}/`);
  }

  getAccById(id: any) {
    return this._http.getRequest(`${environment.api_url}accounting/accounts/${id}/`);
  }

  addAcc(form: any, parendId: any) {
    const params = `?parent_id=${parendId}`
    return this._http.postRequest(`${environment.api_url}accounting/accounts/${params ?? ''}`, form);
  }

  updateAcc(id: number | string, editForm: any) {
    return this._http.patchRequest(`${environment.api_url}/${id}/`, editForm);
  }

  getAccLedgerById(id: any, filterForm: any): Observable<any> {
    return this._http.getRequest(`${environment.api_url}accounting/accounts/${id}/ledger/`);//?${filterForm}
  }

  getAccDashboard(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}accounting/accounts/dashboard/`);
  }

  getAccSearchByParams(id: any) {
    const param = `?account_type=${id}`
    return this._http.getRequest(`${environment.api_url}accounting/accounts/${param}`);
  }

  importPurchase(file: any) {
    return this._http.postRequest(`${environment.api_url}purchases/import/`, file);
  }
}
