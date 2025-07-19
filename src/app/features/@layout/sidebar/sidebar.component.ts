import { urlRoutes } from './../../../core/url.routes';
import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  activeDropdown: string | null = null;
  urlRoutes = urlRoutes;
  user: any;
  userTokenData: any = JSON.parse(localStorage.getItem('user') || '')
  constructor(private router: Router, private _authService: AuthService, public permissionService: PermissionService) {
    // Automatically open the correct dropdown on route change
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        if (url.includes('/super-admin')) {
          this.activeDropdown = 'super-admin';
        } else if (url.includes('/user-management')) {
          this.activeDropdown = 'user-management';
        } else if (url.includes('/contacts')) {
          this.activeDropdown = 'contacts';
        } else if (url.includes('/inventory')) {
          this.activeDropdown = 'inventory';
        } else if (url.includes('/accounting')) {
          this.activeDropdown = 'accounting';
        } else if (url.includes('/settings')) {
          this.activeDropdown = 'settings';
        } else {
          this.activeDropdown = null;
        }
      }
    });
    this.user = this._authService.getUser()
  }

  hasAnyInventoryPermission(): boolean {
    const permissions = [
      10, 95, 87, 83, 79, 14, 75, 91, 108, 104
    ];
    return permissions.some(p => this.permissionService.hasPermission(p));
  }
  hasAnySettingsPermission(): boolean {
    const permissions = [113, 18, 23, 27, 31, 35];
    return permissions.some(p => this.permissionService.hasPermission(p));
  }
  toggleDropdown(name: string): void {
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  isActiveRoute(routePart: string): boolean {
    return this.router.url.includes(routePart);
  }

  logOut() {
    this._authService.logout();
  }
}
