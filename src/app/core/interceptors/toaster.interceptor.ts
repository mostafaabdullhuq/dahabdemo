import { HttpInterceptorFn } from '@angular/common/http';
import {
  HttpErrorResponse,
  HttpResponse,
  HttpRequest,
} from '@angular/common/http';
import { inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterMsgService } from '../services/toaster-msg.service'; // adjust path
import { catchError, tap, throwError } from 'rxjs';

export const toasterInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(ToasterMsgService);
  const router = inject(Router);
  const ngZone = inject(NgZone);

  return next(req).pipe(
    tap(event => {
      const hasPageSize = req.params.get('page_size');      
    
      if (event instanceof HttpResponse && !hasPageSize) {
        const body = event.body;
    
        const hasResultsAndCount =
          body &&
          typeof body === 'object' &&
          'results' in body &&
          'count' in body;
    
        if (!hasResultsAndCount) {
          toaster.showSuccess('Good Job');
        }
      }
    }),
    
    catchError((error: HttpErrorResponse) => {
      const errMsg = error.error?.message || 'Something went wrong.';
      if (error.status === 401) {
        toaster.showError('Unauthorized. Please login again.');

        // Important: Run navigation in Angular zone
        ngZone.run(() => {
          if (router.url !== '/auth/login') {
            router.navigate(['auth/login']);
          }
        });
      } else if (error.error?.errors && typeof error.error.errors === 'object') {
        const errorsObj = error.error.errors;
        Object.keys(errorsObj).forEach((key) => {
          const fieldError = errorsObj[key];
          toaster.showError(`${errMsg}\n${key}: ${fieldError}`);
        });
      }
      else if (error.error?.errors) {
          toaster.showError(`${error.error?.errors}`);
      } else {
        toaster.showError(errMsg);
      }

      return throwError(() => error);
    })
  );
};
