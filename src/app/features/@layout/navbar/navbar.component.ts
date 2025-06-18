import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    items: MenuItem[] | undefined;
    businessName :string =JSON.parse(localStorage.getItem('user') || '')?.business_name; 
    private permissionService = inject(PermissionService)
constructor(){
  this.items = [];

if (this.permissionService.hasPermission(100)) {
  this.items.push({
    label: 'POS',
    icon: 'pi pi-money-bill',
    link: 'pos'
  });
}

this.items.push({
  label: 'Chats',
  icon: 'pi pi-comments',
  badge: '3',
  items: [
    {
      label: 'Team Chat',
      icon: 'pi pi-bolt',
    },
    {
      label: 'Support Chat',
      icon: 'pi pi-server',
    },
  ],
});
}
}
