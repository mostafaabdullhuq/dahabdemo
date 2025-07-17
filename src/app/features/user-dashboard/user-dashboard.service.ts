import { Injectable } from '@angular/core';
import { SingletonService } from '../../core/services/singleton.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {

  constructor(private _http: SingletonService) { }

  getFinancialDashboardData(params: string = ''): Observable<any> {
    return this._http.getRequest(`${environment.api_url}dashboard/financial/?${params}`);
  }
  getInventoryDashboardData(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}dashboard/inventory/`);
  }
  getTransactionsDashboardData(): Observable<any> {
    return this._http.getRequest(`${environment.api_url}dashboard/transactions/`);
  }
}
