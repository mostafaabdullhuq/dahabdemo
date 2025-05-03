import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingBarService } from '@ngx-loading-bar/core';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(LoadingBarService).useRef();
  loader.start();

  return next(req).pipe(
    finalize(() => loader.complete())
  );
};