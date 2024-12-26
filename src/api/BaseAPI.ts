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
    const headers: Record<string, string> = {
      'content-type': 'application/json',
    };

    // Add API key to headers if available and not a public endpoint
    if (this.apiKey && !options.isPublic) {
      headers['x-api-key'] = this.apiKey;
    }

    // Allow environment to modify headers
    const finalHeaders = this.environment
      ? this.environment.createHeaders(headers)
      : headers;

    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: finalHeaders,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
      referrerPolicy: 'strict-origin-when-cross-origin',
    };

    if (options.body) {
      fetchOptions.body = options.body;
    }

    if (this.debug) {
      console.log('[Argos] Making request:', {
        url,
        method: fetchOptions.method,
        headers: finalHeaders,
        body:
          options.body && typeof options.body === 'string'
            ? JSON.parse(options.body)
            : undefined,
      });
      console.log('[Argos] Fetch options:', fetchOptions);
    }

    const response = await fetch(url, fetchOptions);

    if (this.debug) {
      console.log('[Argos] Response status:', response.status);
      // Convert response headers to a plain object for logging
      const responseHeaders: Record<string, string> = {};
      if (response?.headers) {
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        console.log('[Argos] Response headers:', responseHeaders);
      }
    }

    if (!response.ok) {
      const data = this.environment
        ? await this.environment.handleResponse(response)
        : await response.json();

      if (this.debug) {
        console.error('[Argos] API Error:', {
          url,
          status: response.status,
          error: data,
          details: data.details,
        });
      }

      if (response.status === 401 && !options.isPublic) {
        await this.handleUnauthorized();
        return this.fetchApi(endpoint, options);
      }

      throw new Error(data.error || 'Unknown error');
    }

    const data = this.environment
      ? await this.environment.handleResponse(response)
      : await response.json();

    if (this.debug) {
      console.log('[Argos] Response data:', data);
    }

    return data;
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
