import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SingletonService {
  private readonly API_URL = environment.api_url; // Base URL for API requests, can be modified as needed

  constructor(private _httpClient: HttpClient) {
  }

  // GET REQUEST
  getRequest<T>(api: string, params?: any): Observable<T> {
    return this._httpClient.get<T>(api, {params});
  }

  // POST REQUEST
  postRequest<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    let httpOptions: { headers?: HttpHeaders };

    if (body instanceof FormData) {
      httpOptions = {}; // No custom headers; Angular will auto-set multipart/form-data
    } else {
      httpOptions = {
        headers: headers || new HttpHeaders({'Content-Type': 'application/json'}),
      };
    }

    return this._httpClient.post<T>(url, body, httpOptions);
  }

  // DELETE REQUEST
  deleteRequest<T>(api: string): Observable<T> {
    return this._httpClient.delete<T>(api);
  }

  // PUT REQUEST
  putRequest<T>(api: string, payload?: any): Observable<T> {
    return this._httpClient.put<T>(api, payload);
  }

// PATCH REQUEST
  patchRequest<T>(api: string, payload?: any): Observable<T> {
    return this._httpClient.patch<T>(api, payload);
  }

  // Generic methods for API requests

  get<T>(endpoint: string, params: { [key: string]: any } = {}): Observable<T> {
    const _params: HttpParams | {} = params ? new HttpParams({fromObject: params}) : {};
    return this._httpClient.get<T>(this.getEndpointUrl(endpoint), {params: _params});
  }

  post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    let httpOptions: { headers?: HttpHeaders };

    if (body instanceof FormData) {
      httpOptions = {}; // No custom headers; Angular will auto-set multipart/form-data
    } else {
      httpOptions = {
        headers: headers || new HttpHeaders({'Content-Type': 'application/json'}),
      };
    }

    return this._httpClient.post<T>(this.getEndpointUrl(endpoint), body, httpOptions);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this._httpClient.delete<T>(this.getEndpointUrl(endpoint));
  }

  put<T>(endpoint: string, payload?: any): Observable<T> {
    return this._httpClient.put<T>(this.getEndpointUrl(endpoint), payload);
  }

  patch<T>(endpoint: string, payload?: any): Observable<T> {
    return this._httpClient.patch<T>(this.getEndpointUrl(endpoint), payload);
  }

  private getEndpointUrl(endpoint: string): string {
    // Ensure the endpoint not starts with a slash, if it does, remove it.
    if (endpoint.startsWith('/')) {
      endpoint = endpoint.substring(1);
    }

    return `${this.API_URL}${endpoint}`;
  }
}
