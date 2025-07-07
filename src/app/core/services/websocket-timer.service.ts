import { Injectable } from '@angular/core';
import { WebsocketService } from '../../shared/services/websocket.service';
import { BehaviorSubject, Subscription } from 'rxjs';

export interface GoldPrices {
  price_gram_18k: number | null;
  price_gram_21k: number | null;
  price_gram_22k: number | null;
  price_gram_24k: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketTimerService {
  private readonly TWELVE_HOURS_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  private readonly LAST_EXECUTION_KEY = 'websocket_last_execution';
  private timer: any;
  private websocketSubscription!: Subscription;

  // Current gold prices observable
  private currentPricesSubject = new BehaviorSubject<GoldPrices>({
    price_gram_18k: null,
    price_gram_21k: null,
    price_gram_22k: null,
    price_gram_24k: null
  });

  public currentPrices$ = this.currentPricesSubject.asObservable();

  constructor(private websocketService: WebsocketService) {
    console.log("WebsocketTimerService: Starting background service");
    this.setupWebsocketMessageListener();
    this.initializeTimer();

    // Expose for debugging in browser console
    (window as any).websocketTimerService = this;
  }

  private setupWebsocketMessageListener(): void {
    console.log("WebsocketTimerService: Setting up websocket message listener");
    this.websocketSubscription = this.websocketService.messages$.subscribe(
      message => this.handleWebSocketMessage(message)
    );
  }

  private handleWebSocketMessage(message: any): void {
    console.log("WebsocketTimerService: Received message:", message);

    if (message.status === 'success' && message.action === 'get_gold_price') {
      console.log("WebsocketTimerService: Updating gold prices:", message.data);
      this.currentPricesSubject.next(message.data);
    } else if (message.status !== 'success') {
      console.log("WebsocketTimerService: Error message received:", message.message);
    }
  }

  private initializeTimer(): void {
    console.log("WebsocketTimerService: Initializing 12-hour timer");

    // Check if we need to execute immediately based on last execution time
    this.checkAndExecuteIfNeeded();

    // Set up the timer to run every 12 hours
    this.timer = setInterval(() => {
      console.log("WebsocketTimerService: 12-hour timer triggered at:", new Date().toISOString());
      this.sendGoldPriceRequest();
    }, this.TWELVE_HOURS_MS);

    console.log("WebsocketTimerService: Timer set for 12 hours (" + this.TWELVE_HOURS_MS + "ms)");
  }

  private checkAndExecuteIfNeeded(): void {
    const lastExecution = this.getLastExecutionTime();
    const now = Date.now();

    console.log("WebsocketTimerService: Last execution:", lastExecution ? new Date(lastExecution).toISOString() : 'Never');

    // If no last execution or more than 12 hours have passed, execute immediately
    if (!lastExecution || (now - lastExecution) >= this.TWELVE_HOURS_MS) {
      console.log("WebsocketTimerService: Sending immediate gold price request");
      this.sendGoldPriceRequest();
    } else {
      const timeUntilNext = this.TWELVE_HOURS_MS - (now - lastExecution);
      console.log("WebsocketTimerService: Next execution in", Math.round(timeUntilNext / (60 * 60 * 1000)), "hours");
    }
  }

  private sendGoldPriceRequest(): void {
    // Update last execution time
    this.setLastExecutionTime(Date.now());

    // Send websocket message
    console.log("WebsocketTimerService: Sending gold price request");
    this.websocketService.sendMessage({
      'action': "get_gold_price"
    });
  }

  private getLastExecutionTime(): number | null {
    const stored = localStorage.getItem(this.LAST_EXECUTION_KEY);
    return stored ? parseInt(stored, 10) : null;
  }

  private setLastExecutionTime(timestamp: number): void {
    localStorage.setItem(this.LAST_EXECUTION_KEY, timestamp.toString());
  }

  // Public method to manually trigger the websocket call
  public triggerGoldPriceRequest(): void {
    console.log("WebsocketTimerService: Manual trigger requested");
    this.sendGoldPriceRequest();
  }

  // Public method to get current prices
  public getCurrentPrices(): GoldPrices {
    return this.currentPricesSubject.value;
  }

  // Method to get time until next execution (for debugging/monitoring)
  public getTimeUntilNextExecution(): number {
    const lastExecution = this.getLastExecutionTime();
    if (!lastExecution) return 0;

    const nextExecution = lastExecution + this.TWELVE_HOURS_MS;
    const now = Date.now();

    return Math.max(0, nextExecution - now);
  }

  // Debug method to check timer status
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
      intervalSetTo: this.TWELVE_HOURS_MS,
      intervalSetToHours: this.TWELVE_HOURS_MS / (60 * 60 * 1000)
    };
  }

  // Cleanup method
  public destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log("WebsocketTimerService: Timer destroyed");
    }

    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
      console.log("WebsocketTimerService: Websocket subscription destroyed");
    }
  }
}
