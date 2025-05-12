import { PosModule } from './features/pos/pos.module';
import { PosComponent } from './features/pos/pos.component';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './features/@layout/layout/layout/layout.component';

export const routes: Routes = [
    { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
    {
        path: '',
        component:LayoutComponent,
        canMatch: [authGuard],
        loadChildren: () => import('./features/@layout/layout.module').then(m => m.LayoutModule)
    },
    {
        path: 'pos',
        component:PosComponent,
        canMatch: [authGuard],
        loadChildren: () => import('./features/pos/pos.module').then(m => m.PosModule)
    },
    { path: '**', redirectTo: '' },
];
