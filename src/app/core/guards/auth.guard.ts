import { CanMatchFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getAccessToken();
  
  if (token && !isTokenExpired(token)) {
    return true;
  } else {
    router.navigate(['/auth/login']);
    return false;
  }
};

// Check if token is expired
function isTokenExpired(token: string): boolean {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    // Expiration time in milliseconds
    return Date.now() > decoded.exp * 1000;
  } catch (error) {
    return true; // Invalid token if it can't be decoded
  }
}
