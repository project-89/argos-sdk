import {
  ArgosConfig,
  ArgosUser,
  PresenceData,
  EventMap,
  EventType,
  EventHandler,
} from './types';
import { PresenceTracker } from './PresenceTracker';
import { ArgosError } from './errors';
import { EventEmitter } from './EventEmitter';

interface LogMessage {
  message: string;
  data?: Record<string, string | number | boolean>;
}

export class ArgosTracker extends EventEmitter {
  private config: Required<ArgosConfig>;
  private presenceTracker: PresenceTracker | null = null;
  private user: ArgosUser | null = null;

  private constructor(
    private readonly fingerprint: string,
    config: ArgosConfig = {}
  ) {
    super();
    if (!fingerprint) {
      throw new ArgosError('Fingerprint ID is required', 'INVALID_FINGERPRINT');
    }
    this.config = {
      baseUrl: config.baseUrl ?? 'https://api.argos.project89.io',
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      debug: config.debug ?? false,
      metadata: config.metadata ?? {},
    };
  }

  private log({ message, data }: LogMessage): void {
    if (this.config.debug) {
      console.log(`🌌 [Argos]: ${message}`, data ? data : '');
    }
  }

  static async initialize(
    fingerprint: string,
    config?: ArgosConfig
  ): Promise<ArgosTracker> {
    const tracker = new ArgosTracker(fingerprint, config);
    await tracker.initializeUser();
    return tracker;
  }

  private async initializeUser(): Promise<void> {
    this.log({ message: `Initializing user: ${this.fingerprint}` });
    try {
      const response = await fetch(`${this.config.baseUrl}/users/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fingerprint: this.fingerprint,
          metadata: this.config.metadata,
        }),
      });

      if (!response.ok) {
        throw new ArgosError('Failed to initialize user', 'INIT_FAILED');
      }

      const userData = await response.json();
      this.user = userData;
      this.emit('user:update', userData);
    } catch (error) {
      this.log({
        message: 'Failed to initialize user',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error instanceof ArgosError
        ? error
        : new ArgosError(
            error instanceof Error ? error.message : 'Unknown error',
            'INIT_FAILED'
          );
    }
  }

  /**
   * Get the current user from memory
   * @returns The current user or null if not initialized
   */
  getCurrentUser(): ArgosUser | null {
    return this.user;
  }

  /**
   * Get user data, first checking memory then falling back to API
   * @param forceRefresh Force a refresh from the API
   * @returns Promise<ArgosUser>
   */
  async getUser(forceRefresh = false): Promise<ArgosUser> {
    // Return cached user if available and not forcing refresh
    if (!forceRefresh && this.user) {
      return this.user;
    }

    this.log({ message: 'Getting user from API' });
    try {
      const response = await fetch(
        `${this.config.baseUrl}/users/${this.fingerprint}`
      );

      if (!response.ok) {
        throw new ArgosError('Failed to get user', 'REQUEST_FAILED');
      }

      const user = await response.json();
      this.user = user;
      this.emit('user:update', user);
      return user;
    } catch (error) {
      this.log({
        message: 'Failed to get user',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      // Always wrap errors in ArgosError
      const err = new ArgosError(
        error instanceof Error ? error.message : 'Unknown error',
        'REQUEST_FAILED'
      );
      throw err;
    }
  }

  async trackPresence(siteId: string): Promise<void> {
    if (!this.presenceTracker) {
      this.presenceTracker = new PresenceTracker(
        this.fingerprint,
        siteId,
        this.config
      );

      this.presenceTracker.on('presence:update', (data: PresenceData) => {
        this.emit('presence:update', data);
      });

      this.presenceTracker.on('error', (error: Error) => {
        this.emit('error', error);
      });
    }

    await this.presenceTracker.start();
  }

  cleanup(): void {
    this.presenceTracker?.cleanup();
    this.presenceTracker = null;
  }

  on<E extends EventType>(event: E, handler: EventHandler<EventMap[E]>): void {
    super.on(event, handler);
  }

  off<E extends EventType>(event: E, handler: EventHandler<EventMap[E]>): void {
    super.off(event, handler);
  }
}
