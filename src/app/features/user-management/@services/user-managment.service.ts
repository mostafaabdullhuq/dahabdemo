import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UserManagmentService {

  constructor(private _http: SingletonService) { }
  //-----> Users API
  // Get Users 
  getUsers(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    return this._http.getRequest(`${environment.api_url}user`, params );
  }
  addUser(addForm:FormGroup): Observable<any>{
    return this._http.postRequest(`${environment.api_url}user/`,addForm);
  }
  getUserById(id:number | string){
    return this._http.getRequest(`${environment.api_url}user/${id}`);
  }
  updateUser(id:number | string, editForm:FormGroup){
    return this._http.putRequest(`${environment.api_url}user/${id}` , editForm);
  }
  deleteUser(id:number ){
    return this._http.deleteRequest(`${environment.api_url}user/${id}`);
  }

  //-----> Roles API
  // Get Users 
  getRoles(search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    return this._http.getRequest(`${environment.api_url}role`, params );
  }
  addRole(addForm:FormGroup): Observable<any>{
    return this._http.postRequest(`${environment.api_url}role/`,addForm);
  }
  getRoleById(id:number | string){
    return this._http.getRequest(`${environment.api_url}role/${id}`);
  }
  updateRole(id:number | string, editForm:FormGroup){
    return this._http.putRequest(`${environment.api_url}role/${id}` , editForm);
  }
  deleteRole(id:number ){
    return this._http.deleteRequest(`${environment.api_url}role/${id}`);
  }
}
