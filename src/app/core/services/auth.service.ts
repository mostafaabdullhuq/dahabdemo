import { Injectable } from '@angular/core';
import { ITokens } from '../interfaces/itokens.interface';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { SingletonService } from './singleton.service';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { IJwtDecode } from '../interfaces/ijwt-decode';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.api_url;
  private currentTokens$ = new BehaviorSubject<ITokens | null>(this.getTokens());

  constructor(private _http: SingletonService, private router: Router) {}
  login(form: FormGroup, remember: boolean) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this._http.postRequest<ITokens>(`${this.API_URL}user-auth/login/`, form, headers)
      .pipe(
        tap(tokens => {
          console.log(tokens);
          
          this.storeTokens(tokens, remember);
          const decoded: IJwtDecode = jwtDecode(tokens.access);
          if (decoded?.user_id) {
            this.router.navigate(['/main']);
          }
        })
      );
  }

  refreshToken() {
    const tokens = this.getTokens();
    if (!tokens?.refresh) return of(null);

    return this._http.postRequest<ITokens>(`${this.API_URL}/refresh`, { refresh: tokens.refresh }).pipe(
      tap(newTokens => this.storeTokens({ ...tokens, access: newTokens.access })),
      catchError(err => {
        this.logout();
        return of(null);
      })
    );
  }

  logout() {
    localStorage.removeItem('tokens');
    sessionStorage.removeItem('tokens');
    this.currentTokens$.next(null);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    const data = localStorage.getItem('tokens') || sessionStorage.getItem('tokens');
    return data ? JSON.parse(data).access : null;
  }

  private storeTokens(tokens: ITokens, remember = true) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('tokens', JSON.stringify(tokens));
    this.currentTokens$.next(tokens);
  }

  private getTokens(): ITokens | null {
    const data = localStorage.getItem('tokens') || sessionStorage.getItem('tokens');
    return data ? JSON.parse(data) : null;
  }
}
