import { Injectable } from '@angular/core';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { SingletonService } from './singleton.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DropdownsService {
  private API = `${environment.api_url}`

  constructor(private _http: SingletonService) {}
  getBranches(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}branch/`;
    return this._http.getRequest<any>(url);
  }

  getRoles(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}business/roles/`;
    return this._http.getRequest<any>(url);
  }
  getRolesPermissions(nextPageUrl: string | null = null): Observable<any> {
    const url = nextPageUrl || `${this.API}role-permissions/permissions/`;
    return this._http.getRequest<any>(url).pipe(shareReplay(1));
  }
}
