import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PermissionService } from '../../../core/services/permission.service';
import { WebsocketService } from '../../../shared/services/websocket.service';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  items: MenuItem[] | undefined;
  businessName: string = JSON.parse(localStorage.getItem('user') || '')?.business_name;
  private permissionService = inject(PermissionService)
  wsConnection: any;
  messages: string[] = [];
  private websocketSubscription!: Subscription;
  private connectionSubscription!: Subscription;
  private statusMessage!: any;
  private isConnected: boolean = false;
  private lastHandledMessageId!: any;

  constructor(private _websocketService: WebsocketService, private _authService: AuthService) {
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

  ngOnInit() {
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.connectionSubscription = this._websocketService.connectionStatus$.subscribe(
      isConnected => {
        this.isConnected = isConnected;
        if (isConnected) {
          console.log("gold websocket connected...");

          // setInterval(() => {
          //   if (this.isConnected) {
          //     this._websocketService.sendMessage({
          //       'action': "get_gold_price"
          //     })
          //   }
          // }, 1000*60*);
          this.isConnected = true;
        } else {
          this.statusMessage = { type: 'danger', text: 'Disconnected from scanner' };
        }
      }
    );

    this.websocketSubscription = this._websocketService.messages$.subscribe(
      message => this.handleWebSocketMessage(message)
    );
  }

  private handleWebSocketMessage(message: any): void {

    // Avoid duplicates by message id
    if (message.id && message.id === this.lastHandledMessageId) {
      return;
    }
    this.lastHandledMessageId = message.id || null;

    if (message.status === 'success') {
      this.messages.push(message)
    } else {
      this.statusMessage = { type: 'danger', text: message.message || 'WebSocket error occurred' };
    }

    console.log('[WebSocket Received]:', message);
  }

  sendMessage() {
    this.wsConnection.next({ message: 'Hello WebSocket!' });
  }

  ngOnDestroy(): void {
    this.websocketSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
  }
}
