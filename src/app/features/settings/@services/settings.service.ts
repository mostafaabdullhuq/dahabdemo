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
    return this._http.postRequest(`${environment.api_url}Business/`,addForm);
  }
  getBusinessById(id:number | string){
    return this._http.getRequest(`${environment.api_url}business/settings/business/${id}`);
  }
  updateBusiness(id:number | string, editForm:FormGroup | FormData){
    return this._http.patchRequest(`${environment.api_url}business/settings/business/${id}/` , editForm);
  }
  deleteBusiness(id:number ){
    return this._http.deleteRequest(`${environment.api_url}business/settings/business/${id}`);
  }
}
