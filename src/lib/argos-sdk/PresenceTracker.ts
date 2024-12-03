import { EventEmitter } from './EventEmitter';
import { ArgosError } from './errors';
import { ArgosConfig, EventMap, EventType, EventHandler } from './types';

export class PresenceTracker extends EventEmitter {
  private isActive = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly fingerprint: string,
    private readonly siteId: string,
    private readonly config: Required<ArgosConfig>
  ) {
    super();
  }

  async start(): Promise<void> {
    if (this.isActive) {
      return;
    }

    console.log('💓 Starting heartbeat');
    this.isActive = true;

    // Send initial heartbeat
    await this.sendHeartbeat();

    // Start heartbeat interval
    this.heartbeatInterval = setInterval(async () => {
      if (!this.isActive) {
        return;
      }
      await this.sendHeartbeat();
    }, this.config.heartbeatInterval);

    // Handle page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange.bind(this)
      );
    }
  }

  private async sendHeartbeat(): Promise<void> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/presence/heartbeat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fingerprint: this.fingerprint,
            siteId: this.siteId,
          }),
        }
      );

      if (!response.ok) {
        throw new ArgosError('Failed to send heartbeat', 'HEARTBEAT_FAILED');
      }

      const data = await response.json();
      console.log('💓 Heartbeat sent:', data);
      this.emit('presence:update', data);
    } catch (error) {
      // Always wrap errors in ArgosError
      const err = new ArgosError(
        error instanceof Error ? error.message : 'Unknown error',
        'HEARTBEAT_FAILED'
      );
      this.emit('error', err);
    }
  }

  private async cleanupPresence(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/presence/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fingerprint: this.fingerprint,
          siteId: this.siteId,
        }),
      });

      if (!response.ok) {
        throw new ArgosError('Failed to cleanup presence', 'CLEANUP_FAILED');
      }

      await response.json();
    } catch (error) {
      // Always wrap errors in ArgosError
      const err = new ArgosError(
        error instanceof Error ? error.message : 'Unknown error',
        'CLEANUP_FAILED'
      );
      console.error('Failed to cleanup presence:', err.message);
    }

    this.isActive = false;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      console.log('👻 Page hidden, pausing heartbeat');
      this.isActive = false;
    } else {
      console.log('👀 Page visible, resuming heartbeat');
      this.isActive = true;
      this.sendHeartbeat();
    }
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up presence tracker');
    if (typeof document !== 'undefined') {
      document.removeEventListener(
        'visibilitychange',
        this.handleVisibilityChange.bind(this)
      );
    }
    await this.cleanupPresence();
  }

  on<E extends EventType>(event: E, handler: EventHandler<EventMap[E]>): void {
    super.on(event, handler);
  }

  off<E extends EventType>(event: E, handler: EventHandler<EventMap[E]>): void {
    super.off(event, handler);
  }
}
