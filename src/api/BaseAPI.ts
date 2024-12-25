import {
  EnvironmentInterface,
  StorageInterface,
} from '../core/interfaces/environment';
import { ApiResponse } from '../types/api';

export interface FetchApiOptions extends RequestInit {
  isPublic?: boolean;
  skipRetry?: boolean;
}

export interface BaseAPIConfig {
  baseUrl: string;
  apiKey?: string;
  environment?: EnvironmentInterface;
  storage?: StorageInterface;
  debug?: boolean;
  onApiKeyRefresh?: (apiKey: string) => void;
}

export class BaseAPI {
  protected baseUrl: string;
  protected apiKey?: string;
  protected environment?: EnvironmentInterface;
  protected storage?: StorageInterface;
  protected debug: boolean;
  protected onApiKeyRefresh?: (apiKey: string) => void;

  constructor(config: BaseAPIConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.environment = config.environment;
    this.storage = config.storage;
    this.debug = config.debug || false;
    this.onApiKeyRefresh = config.onApiKeyRefresh;
  }

  protected async fetchApi<T>(
    endpoint: string,
    options: FetchApiOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getHeaders(options);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        body: options.body,
      });

      const data = await response.json();

      if (!response.ok) {
        if (this.debug) {
          console.error('[Argos] API Error:', {
            url,
            status: response.status,
            error: data,
          });
        }

        if (response.status === 401 && !options.isPublic) {
          await this.handleUnauthorized();
          return this.fetchApi(endpoint, options);
        }

        throw new Error(data.error || 'Unknown error');
      }

      if (data.success === false) {
        throw new Error(data.error || 'Unknown error');
      }

      return data as T;
    } catch (error) {
      if (this.debug) {
        console.error('[Argos] API Error:', error);
      }
      throw error;
    }
  }

  private async getHeaders(options: FetchApiOptions): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (this.apiKey && !options.isPublic) {
      headers.set('X-API-Key', this.apiKey);
    }

    if (this.environment) {
      headers.set('User-Agent', this.environment.getUserAgent());
    }

    // Add any additional headers from options
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers.set(key, value);
        }
      });
    }

    return headers;
  }

  private async handleUnauthorized(): Promise<void> {
    if (this.debug) {
      console.log('[Argos] API key invalid, attempting to refresh...');
    }

    try {
      if (this.onApiKeyRefresh) {
        const response = await this.fetchApi<{ key: string }>(
          '/api-key/refresh',
          {
            method: 'POST',
            isPublic: true,
            skipRetry: true,
          }
        );

        if (response.key) {
          this.onApiKeyRefresh(response.key);
        }
      }
    } catch (refreshError) {
      if (this.debug) {
        console.error('[Argos] Failed to refresh API key:', refreshError);
      }
      throw refreshError;
    }
  }
}
