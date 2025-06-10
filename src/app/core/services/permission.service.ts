import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissions = new Set<number>();

  constructor() {
    this.loadPermissions();
  }

  private loadPermissions() {
    const userDataJson = localStorage.getItem('user');
    if (userDataJson) {
      const userData = JSON.parse(userDataJson);
      this.permissions = new Set(userData.permissions || []);
    }
  }

  // Call this if permissions update (e.g. user logs in/out)
  refreshPermissions() {
    this.loadPermissions();
  }

  hasPermission(permissionId: number): boolean {
    return this.permissions.has(permissionId);
  }
}
