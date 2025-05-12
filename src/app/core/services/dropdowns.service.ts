import { Injectable } from '@angular/core';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { SingletonService } from './singleton.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DropdownsService {
  private API = `${environment.api_url}`

  constructor(private _http: SingletonService) { }
  getBranches(nextPageUrl: string | null = null, minimal: boolean = true, page: any = 1, pageSize = 1000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    const url = nextPageUrl || `${this.API}branch/?${param}`;
    return this._http.getRequest<any>(url);
  }
  getTaxes(nextPageUrl: string | null = null, minimal: boolean = true, page: any = 1, pageSize = 1000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    const url = nextPageUrl || `${this.API}business/settings/tax-rates/?${param}`;
    return this._http.getRequest<any>(url);
  }
  getRoles(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}business/roles/`;
    return this._http.getRequest<any>(url);
  }

  getCategories(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}product/category/`;
    return this._http.getRequest<any>(url);
  }

  getBrands(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}product/brand/`;
    return this._http.getRequest<any>(url);
  }

  getDesigners(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}product/designer/`;
    return this._http.getRequest<any>(url);
  }
  getStones(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}product/stone/`;
    return this._http.getRequest<any>(url);
  }
  getColor(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}product/color/`;
    return this._http.getRequest<any>(url);
  }
  getUnits(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}product/unit/`;
    return this._http.getRequest<any>(url);
  }
  getPurities(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}product/purity/`;
    return this._http.getRequest<any>(url);
  }
  getSizes(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}product/size/`;
    return this._http.getRequest<any>(url);
  }
  getStockPoints(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}product/stock-point/`;
    return this._http.getRequest<any>(url);
  }
  getProducts(nextPageUrl: string | null = null, params?: string): Observable<any> {
    const url = nextPageUrl || `${this.API}product/?${params}`;
    return this._http.getRequest<any>(url);
  }
  getCustomersGroup(nextPageUrl: string | null = null, params?: string): Observable<any> {
    const url = nextPageUrl || `${this.API}customer/groups/?${params}`;
    return this._http.getRequest<any>(url);
  }

  getCustomers(nextPageUrl: string | null = null, params?: string): Observable<any> {
    const url = nextPageUrl || `${this.API}customer/?${params}`;
    return this._http.getRequest<any>(url);
  }
}
