import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, EMPTY, timer } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, delayWhen, retryWhen, tap, map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment.development';

export interface GoldPrices {
  price_gram_18k: number | null;
  price_gram_21k: number | null;
  price_gram_22k: number | null;
  price_gram_24k: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class LiveGoldRatesService {
  private readonly TIMER_MS = 1000; // 1 second in ms (adjust as needed)
  private readonly LAST_EXECUTION_KEY = 'live_gold_rates_last_execution';
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;

  private connectionStatusSubject = new Subject<boolean>();
  private messagesSubject = new Subject<any>();
  private socket$!: WebSocketSubject<any>;
  private currentPricesSubject = new BehaviorSubject<GoldPrices>({
    price_gram_18k: null,
    price_gram_21k: null,
    price_gram_22k: null,
    price_gram_24k: null
  });
  public messages$ = this.messagesSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public currentPrices$ = this.currentPricesSubject.asObservable();

  private timer: any;
  private isConnected = false;
  private isTimerActive = false;
  private reconnectAttempts = 0;
  private websocketSubscription!: Subscription;
  private authSubscription!: Subscription;

  constructor(private authService: AuthService) {
    // React to login state
    this.authSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.startService();
      } else {
        this.stopService();
      }
    });
    (window as any).liveGoldRatesService = this;
  }

  private getWebSocketUrl(): string {
    const protocol = 'ws';
    // const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const token = this.authService.getAccessToken();
    return `${protocol}://${environment.api_web_socket}ws/gold-rate/?token=${token}`;
  }

  private connect(): void {
    if (this.isConnected) return;
    if (!this.authService.getAccessToken()) return;
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url: this.getWebSocketUrl(),
        closeObserver: {
          next: () => {
            this.connectionStatusSubject.next(false);
            this.isConnected = false;
          }
        },
        openObserver: {
          next: () => {
            this.connectionStatusSubject.next(true);
            this.isConnected = true;
          }
        }
      });

      this.websocketSubscription = this.socket$.pipe(
        tap({
          next: () => {
            this.reconnectAttempts = 0;
            this.connectionStatusSubject.next(true);
            this.isConnected = true;
          },
          error: () => {
            this.connectionStatusSubject.next(false);
            this.isConnected = false;
          }
        }),
        catchError(error => {
          this.isConnected = false;
          return EMPTY;
        }),
        retryWhen(errors => errors.pipe(
          tap(() => {
            if (this.reconnectAttempts++ >= this.maxReconnectAttempts) {
              throw new Error('Max reconnection attempts reached');
            }
          }),
          delayWhen(() => timer(this.reconnectDelay))
        ))
      ).subscribe(
        (message) => this.handleWebSocketMessage(message),
        () => { this.isConnected = false; },
        () => { this.isConnected = false; }
      );
    }
  }

  private handleWebSocketMessage(message: any): void {
    this.messagesSubject.next(message);
    if (message.status === 'success' && message.action === 'get_gold_price') {
      this.currentPricesSubject.next(message.data);
    }
  }

  private startService(): void {
    if (this.isConnected && this.isTimerActive) return;
    this.connect();
    this.setupTimer();
  }

  private stopService(): void {
    this.destroy();
  }

  private setupTimer(): void {
    this.isTimerActive = true;
    this.checkAndExecuteIfNeeded();
    this.timer = setInterval(() => {
      this.sendGoldPriceRequest();
    }, this.TIMER_MS);
  }

  private checkAndExecuteIfNeeded(): void {
    const lastExecution = this.getLastExecutionTime();
    const now = Date.now();
    if (!lastExecution || (now - lastExecution) >= this.TIMER_MS) {
      this.sendGoldPriceRequest();
    }
  }

  private sendGoldPriceRequest(): void {
    this.setLastExecutionTime(Date.now());
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next({ action: 'get_gold_price' });
    }
  }

  private getLastExecutionTime(): number | null {
    const stored = localStorage.getItem(this.LAST_EXECUTION_KEY);
    return stored ? parseInt(stored, 10) : null;
  }

  private setLastExecutionTime(timestamp: number): void {
    localStorage.setItem(this.LAST_EXECUTION_KEY, timestamp.toString());
  }

  // Public API
  public triggerGoldPriceRequest(): void {
    this.sendGoldPriceRequest();
  }

  public getCurrentPrices(): GoldPrices {
    return this.currentPricesSubject.value;
  }

  public getTimeUntilNextExecution(): number {
    const lastExecution = this.getLastExecutionTime();
    if (!lastExecution) return 0;
    const nextExecution = lastExecution + this.TIMER_MS;
    const now = Date.now();
    return Math.max(0, nextExecution - now);
  }

  public getTimerStatus(): any {
    const lastExecution = this.getLastExecutionTime();
    const now = Date.now();
    const timeSinceLastExecution = lastExecution ? now - lastExecution : 0;
    return {
      timerActive: !!this.timer,
      lastExecution: lastExecution ? new Date(lastExecution).toISOString() : 'Never',
      timeSinceLastExecution: timeSinceLastExecution,
      timeSinceLastExecutionHours: timeSinceLastExecution / (60 * 60 * 1000),
      nextExecutionIn: this.getTimeUntilNextExecution(),
      nextExecutionInHours: this.getTimeUntilNextExecution() / (60 * 60 * 1000),
      intervalSetTo: this.TIMER_MS,
      intervalSetToHours: this.TIMER_MS / (60 * 60 * 1000)
    };
  }

  public destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.isTimerActive = false;
    }
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
      this.websocketSubscription = undefined!;
    }
    if (this.socket$) {
      this.socket$.complete();
      this.isConnected = false;
    }
  }

  public ngOnDestroy(): void {
    this.destroy();
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
      this.authSubscription = undefined!;
    }
  }
}
