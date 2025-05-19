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
   addBusiness(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}business/settings/business/`,addForm);
  }
  getBusinessById(id:number | string){
    return this._http.getRequest(`${environment.api_url}business/settings/business/${id}`);
  }
  updateBusiness(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}business/settings/business/${id}/` , editForm);
  }
  deleteBusiness(id:number ){
    return this._http.deleteRequest(`${environment.api_url}business/settings/business/${id}/`);
  }

  getCustomFields():Observable<any>{
    return this._http.getRequest(`${environment.api_url}business/settings/business-custom-fields/`);
  }
  updateCustomFields(form:any):Observable<any>{
    return this._http.patchRequest(`${environment.api_url}business/settings/business-custom-fields/`,form);
  }

  addBranch(addForm:FormGroup | FormData): Observable<any>{
    return this._http.postRequest(`${environment.api_url}branch/`,addForm);
  }
  getBranchById(id:any): Observable<any>{
    return this._http.getRequest(`${environment.api_url}branch/${id}/`);
  }
  updateBranch(id:any,addForm:FormGroup | FormData): Observable<any>{
    return this._http.patchRequest(`${environment.api_url}branch/${id}/`,addForm);
  }
  deleteBranch(id:number ){
    return this._http.deleteRequest(`${environment.api_url}branch/${id}/`);
  }

      getBranchCustomLabel(){
    return this._http.getRequest(`${environment.api_url}branch/custom-field-label/` );
  }
    getBranches(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // const params = new HttpParams()
    //   .set('', search)
    //   .set('page', page.toString())
    //   .set('page_size', pageSize.toString());
      const params = `?${search}&page=${page}&page_size=${pageSize}`
    return this._http.getRequest(`${environment.api_url}branch/${params}` );
  }
}
