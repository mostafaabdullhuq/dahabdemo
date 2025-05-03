import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
//primeNG
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { updatePreset } from '@primeng/themes';
import { authInterceptor } from './core/interceptors/auth.nterceptor';
import { MessageService } from 'primeng/api';
import { toasterInterceptor } from './core/interceptors/toaster.interceptor';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';

const MyPreset = updatePreset(Aura, {
  semantic: {
      primary: {
          50: '{emerald.50}',
          100: '{emerald.100}',
          200: '{emerald.200}',
          300: '{emerald.300}',
          400: '{emerald.400}',
          500: '{emerald.500}',
          600: '{emerald.600}',
          700: '{emerald.700}',
          800: '{emerald.800}',
          900: '{emerald.900}',
          950: '{emerald.950}'
      }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes),
     provideHttpClient(withInterceptors([authInterceptor ,toasterInterceptor ,loaderInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyPreset, options: {
          semantic: {
            primary: {
                50: '{emerald.50}',
                100: '{emerald.100}',
                200: '{emerald.200}',
                300: '{emerald.300}',
                400: '{emerald.400}',
                500: '{emerald.500}',
                600: '{emerald.600}',
                700: '{emerald.700}',
                800: '{emerald.800}',
                900: '{emerald.900}',
                950: '{emerald.950}'
            }
        }
        }
      },
    }),
    MessageService,
    ]
};
