import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SingletonService {

  constructor(private _httpClient: HttpClient) { }

  // GET REQUEST
  getRequest<T>(api: string, params?:any): Observable<T> {
    return this._httpClient.get<T>(api , {params});
  }

  // POST REQUEST
  postRequest<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    let httpOptions: { headers?: HttpHeaders };
  
    if (body instanceof FormData) {
      httpOptions = {}; // No custom headers; Angular will auto-set multipart/form-data
    } else {
      httpOptions = {
        headers: headers || new HttpHeaders({ 'Content-Type': 'application/json' }),
      };
    }
  
    return this._httpClient.post<T>(url, body, httpOptions);
  }
  
  // DELETE REQUEST
  deleteRequest<T>(api: string): Observable<T> {
    return this._httpClient.delete<T>(api);
  }

  // PUT REQUEST
  putRequest<T>(api: string ,payload?: any): Observable<T> {
    return this._httpClient.put<T>(api , payload);
  }

// PATCH REQUEST
patchRequest<T>(api: string ,payload?: any): Observable<T> {
  return this._httpClient.patch<T>(api , payload);
}
}
