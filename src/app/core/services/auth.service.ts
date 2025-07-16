import { Injectable } from '@angular/core';
import { ITokens } from '../interfaces/itokens.interface';
import { BehaviorSubject, catchError, of, tap, map } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { SingletonService } from './singleton.service';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { IJwtDecode } from '../interfaces/ijwt-decode';
import { jwtDecode } from 'jwt-decode';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.api_url;
  private currentTokens$ = new BehaviorSubject<ITokens | null>(this.getTokens());
  private currentUser$ = new BehaviorSubject<User | null>(null);

  // Public observable for login state
  public readonly isLoggedIn$ = this.currentTokens$.asObservable().pipe(
    map(tokens => !!tokens)
  );

  constructor(private _http: SingletonService, private router: Router) { }
  login(form: FormGroup, remember: boolean) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this._http.postRequest<ITokens>(`${this.API_URL}user-auth/login/`, form, headers)
      .pipe(
        tap(tokens => {
          this.storeTokens(tokens, remember);

          const decoded: User = jwtDecode(tokens.access);
          if (decoded?.user_id) {
            localStorage.setItem('user', JSON.stringify(decoded));
            this.currentUser$.next(decoded);

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
    this.resetState();
    this.router.navigate(['/auth/login']);
  }

  resetState() {
    sessionStorage.removeItem('access_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('tokens');
    sessionStorage.removeItem('tokens');
    localStorage.removeItem('user'); // Remove user data
    this.currentTokens$.next(null);
    this.currentUser$.next(null);
  }

  getAccessToken(): string | null {
    const data = localStorage.getItem('tokens') || sessionStorage.getItem('tokens');
    return data ? JSON.parse(data).access : null;
  }

  private storeTokens(tokens: ITokens, remember = true) {
    const storage = localStorage;
    storage.setItem('tokens', JSON.stringify(tokens));
    this.currentTokens$.next(tokens);
  }

  private getTokens(): ITokens | null {
    const data = localStorage.getItem('tokens') || sessionStorage.getItem('tokens');
    return data ? JSON.parse(data) : null;
  }

  getUser(): any | null {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }
}
