import { Injectable } from '@angular/core';
import { map, Observable, of, shareReplay, tap } from 'rxjs';
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

  getSuppliers(nextPageUrl: string | null = null, minimal: boolean = true, page: any = 1, pageSize = 1000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    const url = nextPageUrl || `${this.API}suppliers/?${param}`;
    return this._http.getRequest<any>(url);
  }

  // getTaxes(nextPageUrl: string | null = null, minimal: boolean = true, page: any = 1, pageSize = 1000000): Observable<any> {
  //   const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
  //   const url = nextPageUrl || `${this.API}business/settings/tax-rates/?${param}`;
  //   return this._http.getRequest<any>(url);
  // }

  getTaxes(nextPageUrl: string | null = null, minimal: boolean = true, page: any = 1, pageSize = 1000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`;
    const url = nextPageUrl || `${this.API}business/settings/tax-rates/?${param}`;

    return this._http.getRequest<any>(url).pipe(
      map(res => {
        res.results = res.results.map((tax: any) => ({
          ...tax,
          rate: (tax.rate && parseFloat(tax.rate) !== 0) ? tax.rate : tax.country_tax_rate
        }));
        return res;
      })
    );
  }

  getBranchCountries(nextPageUrl: string | null = null, minimal: boolean = true, page: any = 1, pageSize = 1000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    const url = nextPageUrl || `${this.API}branch/countries/?${param}`;
    return this._http.getRequest<any>(url);
  }

  getAllCountries() {
    return this._http.get<any>("core/country-tax?page_size=34"); // for all countries (workaround)
  }

  getCountryCore(nextPageUrl: string | null = null, minimal: boolean = true, page: any = 1, pageSize = 1000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    const url = nextPageUrl || `${this.API}core/country-tax/?${param}`;
    return this._http.getRequest<any>(url);
  }

  getUsers(nextPageUrl: string | null = null, minimal: boolean = true, page: any = 1, pageSize = 1000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    const url = nextPageUrl || `${this.API}user/?${param}`;
    return this._http.getRequest<any>(url);
  }

  getAccounts(nextPageUrl: string | null = null, minimal: boolean = true, page: any = 1, pageSize = 1000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    const url = nextPageUrl || `${this.API}accounting/accounts/subaccounts/?${param}`;
    return this._http.getRequest<any>(url);
  }

  getMainAccounts(nextPageUrl: string | null = null, minimal: boolean = true, page: any = 1, pageSize = 1000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    const url = nextPageUrl || `${this.API}accounting/accounts/`;
    return this._http.getRequest<any>(url);
  }
  //   getSubAccounts(nextPageUrl: string | null = null, minimal: boolean = true, page: any = 1, pageSize = 1000000): Observable<any> {
  //   const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
  //   const url = nextPageUrl || `${this.API}accounting/accounts/subaccounts/?${param}`;
  //   return this._http.getRequest<any>(url);
  // }

  getRoles(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}business/roles/`;
    return this._http.getRequest<any>(url);
  }

  getScraps(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}purchases/payment/scrap/`;
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

  getProducts(minimal: boolean = true, params?: string, page: number = 1, pageSize: number = 100000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    const url = `${this.API}product/?${params ?? param}`;
    return this._http.getRequest<any>(url);
  }

  getTTBs(nextPageUrl: string | null = null, params?: string): Observable<any> {
    const url = nextPageUrl || `${this.API}purchases/payment/ttb/`;
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

  getTimeZones(nextPageUrl: string | null = null, params?: string): Observable<any> {
    const url = nextPageUrl || `${this.API}core/time-zones/?${params}`;
    return this._http.getRequest<any>(url);
  }

  getCurrencies(minimal: boolean = true, params?: string, page: number = 1, pageSize: number = 100000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    const url = `${this.API}business/settings/currencies/?${param}`;
    return this._http.getRequest<any>(url);
  }

  getBusinessCurrency(businessId: number): Observable<{
    id: number,
    code: string,
    symbol: string,
    name: string,
    decimal_point: string
  }> {
    const url = `${this.API}business/settings/currencies/${businessId}`;
    return this._http.getRequest<any>(url);
  }

  getCurrenciesFromCore(minimal: boolean = true, params?: string, page: number = 1, pageSize: number = 100000000): Observable<any> {
    const param = `minimal=${minimal}&page=${page}&page_size=${pageSize}`
    const url = `${this.API}core/currencies/?${param}`;
    return this._http.getRequest<any>(url);
  }

  getPaymentMethods(params?: string): Observable<any> {
    return this._http.getRequest(`${environment.api_url}business/settings/payment-methods/?${params}`);
  }
}
