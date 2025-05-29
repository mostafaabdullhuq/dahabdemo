import { Injectable } from '@angular/core';
import { SingletonService } from '../../../core/services/singleton.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PosRepairService {
  private repairProductsSubject = new BehaviorSubject<any[]>([]);
  repairProducts$ = this.repairProductsSubject.asObservable();

  constructor(private _http: SingletonService) {
    this.fetchRepairProducts(); // optionally load on service init
  }

  addRepairProduct(form: any): Observable<any> {
    return this._http.postRequest(`${environment.api_url}pos/order-product/repair/`, form).pipe(
      tap(() => this.fetchRepairProducts())
    );
  }

  fetchRepairProducts(): void {
    this._http.getRequest(`${environment.api_url}pos/order-product-receipt/repair/`).subscribe({
      next: (res: any) => {
        this.repairProductsSubject.next(res || []);
      },
      error: () => {
        this.repairProductsSubject.next([]);
      }
    });
  }

  get currentRepairProducts(): any[] {
    return this.repairProductsSubject.value;
  }
}
