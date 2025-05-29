import Aura from '@primeng/themes/aura';
import { Injectable } from '@angular/core';
import { updatePreset } from '@primeng/themes';
import { BehaviorSubject } from 'rxjs';
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
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private theme$ = new BehaviorSubject(StonePreset);  // Use StonePreset directly here

  setTheme(preset: any) {
    this.theme$.next(preset);
    // For example, update document attribute or something
    document.documentElement.setAttribute('data-theme', preset.name || 'stone');
  }

  getTheme() {
    return this.theme$.asObservable();
  }
}
