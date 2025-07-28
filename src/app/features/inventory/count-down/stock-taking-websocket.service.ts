// stock-taking-websocket.service.ts
import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject, timer, EMPTY } from 'rxjs';
import { catchError, tap, retryWhen, delayWhen } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class StockTakingWebsocketService {
  private socket$!: WebSocketSubject<any>;
  private messagesSubject = new Subject<any>();
  public messages$ = this.messagesSubject.asObservable();
  private connectionStatusSubject = new Subject<boolean>();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;

  constructor(private authService: AuthService) {
    this.connect();
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'ws';
    const token = this.authService.getAccessToken(); // Get token from your auth service
    return `${protocol}://${environment.api_web_socket}ws/stock-taking/?token=${token}`;
  }

  private connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();

      this.socket$.pipe(
        tap({
          next: () => {
            this.reconnectAttempts = 0;
            this.connectionStatusSubject.next(true);
          },
          error: () => this.connectionStatusSubject.next(false)
        }),
        catchError(error => {
          console.error('WebSocket error:', error);
          return EMPTY;
        }),
        retryWhen(errors => errors.pipe(
          tap(err => {
            if (this.reconnectAttempts++ >= this.maxReconnectAttempts) {
              throw new Error('Max reconnection attempts reached');
            }
          }),
          delayWhen(() => timer(this.reconnectDelay))
        ))
      ).subscribe(
        (message) => this.messagesSubject.next(message),
        (err) => console.error('WebSocket error:', err),
        () => console.log('WebSocket connection closed')
      );
    }
  }

  private getNewWebSocket(): WebSocketSubject<any> {
    return webSocket({
      url: this.getWebSocketUrl(),
      closeObserver: {
        next: () => {
          console.log('WebSocket connection closed');
          this.connectionStatusSubject.next(false);
        }
      },
      openObserver: {
        next: () => {
          console.log('WebSocket connection established');
          this.connectionStatusSubject.next(true);
        }
      }
    });
  }

  public sendMessage(message: any): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next(message);
    } else {
      console.error('WebSocket connection not established');
    }
  }

  public close(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
