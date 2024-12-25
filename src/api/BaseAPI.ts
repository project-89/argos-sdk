import {
  EnvironmentInterface,
  StorageInterface,
} from '../core/interfaces/environment';

export interface BaseAPIConfig {
  baseUrl: string;
  apiKey?: string;
  debug?: boolean;
  environment?: EnvironmentInterface;
  storage?: StorageInterface;
}

export interface FetchApiOptions extends RequestInit {
  isPublic?: boolean;
}

export class BaseAPI {
  protected baseUrl: string;
  protected apiKey?: string;
  protected debug: boolean;
  protected environment?: EnvironmentInterface;
  protected storage?: StorageInterface;

  constructor(config: BaseAPIConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.debug = config.debug || false;
    this.environment = config.environment;
    this.storage = config.storage;
  }

  protected async fetchApi<T>(
    endpoint: string,
    options: FetchApiOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (this.apiKey) {
      headers.set('X-API-Key', this.apiKey);
    }

    if (this.environment) {
      headers.set('User-Agent', this.environment.getUserAgent());
    }

    // Add origin header for protected routes
    if (!options.isPublic) {
      headers.set('Origin', 'http://localhost:3000');
    }

    // Add any additional headers from options
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers.set(key, value);
        }
      });
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));

      if (this.debug) {
        console.error('[Argos] API Error:', {
          url,
          status: response.status,
          error,
        });
      }

      // Format the error message
      const errorMessage = error.error || error.message || response.statusText;
      throw new Error(errorMessage);
    }

    return response.json();
  }
}
