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

export const StonePreset = updatePreset(Aura, {
  semantic: {
    primary: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
    },
    surface: {
      background: '#fafaf9',
      card: '#ffffff',
      border: '#e7e5e4'
    },
    text: {
      primary: '#1c1917',
      secondary: '#57534e'
    }
  }
});

export const DarkStonePreset = updatePreset(Aura, {
  semantic: {
    primary: {
      50: '#d6d3d1',
      100: '#a8a29e',
      200: '#78716c',
      300: '#57534e',
      400: '#44403c',
      500: '#292524',
      600: '#1c1917',
      700: '#0e0c0a',
      800: '#0a0907',
      900: '#050403'
    },
    surface: {
      background: '#1c1917',
      card: '#292524',
      border: '#44403c'
    },
    text: {
      primary: '#fafaf9',
      secondary: '#d6d3d1'
    }
  }
});
const selectedTheme = StonePreset; // Can be changed dynamically later

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes),
     provideHttpClient(withInterceptors([authInterceptor ,toasterInterceptor ,loaderInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: selectedTheme,
        options: { semantic: selectedTheme.semantic }
      }
    }),
    MessageService,
    ]
};
