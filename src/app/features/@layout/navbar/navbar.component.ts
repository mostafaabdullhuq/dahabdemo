import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    items: MenuItem[] | undefined;

constructor(){
  this.items = [
    {
        label: 'POS',
        icon: 'pi pi-money-bill',
        link:'pos'
    },
    {
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
                // shortcut: '⌘+B',
            },
        ],
    },
];
}
}
