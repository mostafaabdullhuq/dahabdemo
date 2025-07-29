import { Injectable, NgZone } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject, timer, EMPTY } from 'rxjs';
import { catchError, tap, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment.development';
import { SingletonService } from '../../../core/services/singleton.service';

@Injectable({
  providedIn: 'root'
})
export class StockTakingService {
  constructor(private http: SingletonService) { }

  getActiveStockTaking(branch: string = '', category: string = '', stockpoint: string = ''): Observable<any> {
    let params = "?"

    if (branch) {
      params += `branch=${branch}`
    }

    if (category) {
      params += `category=${category}`
    }

    if (stockpoint) {
      params += `stock_point=${stockpoint}`
    }

    return this.http.getRequest(
      `${environment.api_url}product/stock-taking/active/${params}`
    );
  }

  initializeStockTaking(form: any): Observable<any> {
    return this.http.postRequest(
      `${environment.api_url}product/stock-taking/initialize/`,
      form
    );
  }

  completeStockTaking(stockTakingId: string): Observable<any> {
    return this.http.patchRequest(
      `${environment.api_url}product/stock-taking/${stockTakingId}/complete/`,
      {}
    );
  }

  getStockTakingReport(stockTakingId: string): Observable<any> {
    return this.http.get(`product/stock-taking/${stockTakingId}/report/`);
  }
}
