import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private _http: SingletonService) { }
  //-----> Customers API
  // Get Customers 
  getCustomers(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}customer${params}` );
  }
  addCustomer(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}customer/`,addForm);
  }
  getCustomerById(id:number | string){
    return this._http.getRequest(`${environment.api_url}customer/${id}`);
  }
  updateCustomer(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}customer/${id}/` , editForm);
  }
  deleteCustomer(id:number ){
    return this._http.deleteRequest(`${environment.api_url}customer/${id}/`);
  }
  getCustomerCustomLabel(){
    return this._http.getRequest(`${environment.api_url}customer/custom-field-label/` );
  }
  getCustomerTransactions(id:any,search: string = '', page: number = 1, pageSize: number = 10){
     // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}customer/transactions/${id}/${params}` );
  }
  getCustomerLedgers(id:any,search: string = '', page: number = 1, pageSize: number = 10):Observable<any>{
     // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
    const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}customer/ledger/${id}/${params}` );
  }
  getCustomerPayments(id:any,search: string = '', page: number = 1, pageSize: number = 10){
    // const params = new HttpParams()
   //   .set('', search)
   //   .set('page', page.toString())
   //   .set('page_size', pageSize.toString());
   const params = `?${search}&page=${page}&page_size=${pageSize}`
   return this._http.getRequest(`${environment.api_url}customer/payments/${id}/${params}` );
 }
 getCustomerDocuments(id:any,search: string = '', page: number = 1, pageSize: number = 10){
  // const params = new HttpParams()
 //   .set('', search)
 //   .set('page', page.toString())
 //   .set('page_size', pageSize.toString());
 const params = `?${search}&page=${page}&page_size=${pageSize}`
 return this._http.getRequest(`${environment.api_url}customer/docs/${id}/${params}` );
}
addAttach(customerId:any,addForm:any){
  return this._http.postRequest(`${environment.api_url}customer/docs/${customerId}/add/`,addForm);
}
deleteAttach(customerId:any,id:any){
  return this._http.deleteRequest(`${environment.api_url}customer/docs/${customerId}/${id}/`);
}
  // Get Customers Group 
  getCustomersGroup(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}customer/groups/${params}` );
  }
  addCustomerGroup(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}customer/groups/`,addForm);
  }
  getCustomerGroupById(id:number | string){
    return this._http.getRequest(`${environment.api_url}customer/groups/${id}`);
  }
  updateCustomerGroup(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}customer/groups/${id}/` , editForm);
  }
  deleteCustomerGroup(id:number ){
    return this._http.deleteRequest(`${environment.api_url}customer/groups/${id}`);
  }

  // Get Suppliers 
  getSuppliers(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}suppliers${params}` );
  }
  addSupplier(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}suppliers/`,addForm);
  }
  getSupplierById(id:number | string){
    return this._http.getRequest(`${environment.api_url}suppliers/${id}`);
  }
  updateSupplier(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}suppliers/${id}/` , editForm);
  }
  deleteSupplier(id:number ){
    return this._http.deleteRequest(`${environment.api_url}suppliers/${id}/`);
  }

  getSupplierInventory(id:any,search: string = '', page: number = 1, pageSize: number = 10){
    // const params = new HttpParams()
   //   .set('', search)
   //   .set('page', page.toString())
   //   .set('page_size', pageSize.toString());
   const params = `?${search}&page=${page}&page_size=${pageSize}`
   return this._http.getRequest(`${environment.api_url}suppliers/inventory/${id}/${params}` );
 }
 getsupplierPayments(id:any,search: string = '', page: number = 1, pageSize: number = 10){
   // const params = new HttpParams()
  //   .set('', search)
  //   .set('page', page.toString())
  //   .set('page_size', pageSize.toString());
  const params = `?${search}&page=${page}&page_size=${pageSize}`
  return this._http.getRequest(`${environment.api_url}suppliers/payment/${id}/${params}` );
}
getSupplierDocuments(id:any,search: string = '', page: number = 1, pageSize: number = 10){
 // const params = new HttpParams()
//   .set('', search)
//   .set('page', page.toString())
//   .set('page_size', pageSize.toString());
const params = `?${search}&page=${page}&page_size=${pageSize}`
return this._http.getRequest(`${environment.api_url}suppliers/docs/${id}/${params}` );
}
getSupplierParchases(id:any,search: string = '', page: number = 1, pageSize: number = 10){
    // const params = new HttpParams()
   //   .set('', search)
   //   .set('page', page.toString())
   //   .set('page_size', pageSize.toString());
   const params = `?${search}&page=${page}&page_size=${pageSize}`
   return this._http.getRequest(`${environment.api_url}suppliers/purchases/${id}/${params}` );
 }
addAttachSupplier(supplierId:any,addForm:any){
 return this._http.postRequest(`${environment.api_url}suppliers/docs/${supplierId}/add/`,addForm);
}
deleteAttachSupplier(supplierId:any,id:any){
 return this._http.deleteRequest(`${environment.api_url}suppliers/docs/${supplierId}/${id}/`);
}

///Imports
  importCustomers(file:any){
    return this._http.postRequest(`${environment.api_url}customer/import/`, file);
  }
   importSuppliers(file:any){
    return this._http.postRequest(`${environment.api_url}suppliers/import/`, file);
  }
}
