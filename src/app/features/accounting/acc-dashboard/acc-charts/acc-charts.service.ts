import { Injectable } from '@angular/core';
import { SingletonService } from '../../../../core/services/singleton.service';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AccChartsService {
  constructor(private _http: SingletonService) { }

  getAssetsChart(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}accounting/accounts/assets-chart/`);
  }

  getExpensesChart(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}accounting/accounts/expenses-chart/`);
  }

  getLiabilitiesChart(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}accounting/accounts/liabilities-chart/`);
  }

  getRevenueChart(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}accounting/accounts/revenue-chart/`);
  }
}
