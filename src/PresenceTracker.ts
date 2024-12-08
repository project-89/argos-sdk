import { EventEmitter } from 'events';

export type EventHandler<T> = (data: T) => void;
export type ErrorHandler = (error: Error) => void;

export interface PresenceTrackerConfig {
  interval?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface PresenceData {
  timestamp: string;
  status: 'online' | 'offline';
}

export class PresenceTracker extends EventEmitter {
  private interval: number;
  private retryAttempts: number;
  private retryDelay: number;
  private isTracking: boolean = false;
  private retryCount: number = 0;
  private timeoutId?: NodeJS.Timeout;

  constructor(config?: PresenceTrackerConfig) {
    super();
    this.interval = config?.interval || 30000; // 30 seconds
    this.retryAttempts = config?.retryAttempts || 3;
    this.retryDelay = config?.retryDelay || 5000; // 5 seconds
  }

  public start(): void {
    if (this.isTracking) return;
    this.isTracking = true;
    this.track();
  }

  public stop(): void {
    this.isTracking = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  public isActive(): boolean {
    return this.isTracking;
  }

  private track(): void {
    if (!this.isTracking) return;

    this.updatePresence()
      .then(() => {
        this.retryCount = 0;
        if (this.isTracking) {
          this.timeoutId = setTimeout(() => this.track(), this.interval);
        }
      })
      .catch((error: Error) => {
        this.handleError(error);
      });
  }

  private async updatePresence(): Promise<void> {
    try {
      const presenceData: PresenceData = {
        timestamp: new Date().toISOString(),
        status: navigator.onLine ? 'online' : 'offline',
      };
      this.emit('presence', presenceData);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to update presence');
      this.emit('error', err);
      throw err;
    }
  }

  private handleError(error: Error): void {
    this.emit('error', error);

    if (this.retryCount < this.retryAttempts) {
      this.retryCount++;
      if (this.isTracking) {
        this.timeoutId = setTimeout(() => this.track(), this.retryDelay);
      }
    } else {
      this.stop();
      this.emit('maxRetries');
    }
  }

  public on(event: 'presence', handler: EventHandler<PresenceData>): this;
  public on(event: 'error', handler: ErrorHandler): this;
  public on(event: 'maxRetries', handler: () => void): this;
  public on(
    event: string,
    handler: EventHandler<any> | ErrorHandler | (() => void)
  ): this {
    return super.on(event, handler);
  }

  public off(
    event: string,
    handler: EventHandler<any> | ErrorHandler | (() => void)
  ): this {
    return super.off(event, handler);
  }
}
