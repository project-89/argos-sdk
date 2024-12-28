import { EnvironmentInterface } from '../interfaces/environment';
import { ApiResponse } from '../interfaces/api';
import { HttpMethod } from '../interfaces/http';

export interface BaseAPIConfig {
  baseUrl: string;
  apiKey?: string;
  environment: EnvironmentInterface;
  debug?: boolean;
  onApiKeyRefresh?: (newApiKey: string) => void;
}

export abstract class BaseAPI {
  protected baseUrl: string;
  protected apiKey?: string;
  protected environment: EnvironmentInterface;
  protected debug: boolean;
  private onApiKeyRefresh?: (newApiKey: string) => void;

  constructor(config: BaseAPIConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.environment = config.environment;
    this.debug = config.debug || false;
    this.onApiKeyRefresh = config.onApiKeyRefresh;
  }

  protected async fetchApi<T>(
    endpoint: string,
    options: {
      method?: HttpMethod;
      headers?: Record<string, string>;
      body?: unknown;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { method = HttpMethod.GET, headers = {}, body } = options;

    const environmentHeaders = this.environment.createHeaders({
      'content-type': 'application/json',
      accept: '*/*',
      origin: 'http://127.0.0.1:5001',
      'user-agent': this.environment.getUserAgent(),
      ...headers,
    });

    const finalHeaders = new Headers(environmentHeaders);

    if (this.apiKey) {
      finalHeaders.set('x-api-key', this.apiKey);
    }

    const url = `${this.baseUrl}${endpoint}`;

    if (this.debug) {
      console.log('[Argos] Request details:', {
        fullUrl: url,
        baseUrl: this.baseUrl,
        endpoint,
        method,
        headers: Object.fromEntries(finalHeaders.entries()),
        body: body ? JSON.stringify(body) : undefined,
      });
    }

    const fetchOptions: RequestInit = {
      method,
      headers: finalHeaders,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
      referrerPolicy: 'strict-origin-when-cross-origin',
    } as RequestInit;

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    if (this.debug) {
      console.log('[Argos] Fetch options:', {
        ...fetchOptions,
        headers: Object.fromEntries(finalHeaders.entries()),
      });
    }

    try {
      const response = await this.environment.fetch(url, fetchOptions);

      if (this.debug) {
        console.log('[Argos] Response status:', response.status);
      }

      if (this.debug) {
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        console.log('[Argos] Response headers:', headers);
        console.log(
          '[Argos] Content-Type:',
          response.headers.get('content-type')
        );
      }

      // Handle 401 by attempting to refresh the API key
      if (response.status === 401 && this.apiKey) {
        try {
          const newApiKey = await this.refreshApiKey(this.apiKey);
          if (newApiKey) {
            this.apiKey = newApiKey;
            if (this.onApiKeyRefresh) {
              this.onApiKeyRefresh(newApiKey);
            }
            // Retry the request with the new API key
            return this.fetchApi(endpoint, options);
          }
        } catch (refreshError) {
          if (this.debug) {
            console.error('[Argos] Failed to refresh API key:', refreshError);
          }
          throw refreshError;
        }
      }

      const responseData = await response.json();

      if (this.debug) {
        console.log(
          '[Argos] Response data (raw):',
          JSON.stringify(responseData)
        );
        console.log('[Argos] Response data (parsed):', responseData);
        console.log('[Argos] Response type:', typeof responseData);
        console.log('[Argos] Response keys:', Object.keys(responseData));
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'API request failed');
      }

      // Validate response format
      if (typeof responseData !== 'object' || responseData === null) {
        throw new Error('Invalid response format: response is not an object');
      }

      if (!('success' in responseData)) {
        throw new Error('Invalid response format: missing success field');
      }

      if (!responseData.success && !responseData.error) {
        throw new Error('Request failed without error message');
      }

      return responseData as ApiResponse<T>;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (this.debug) {
        console.error('[Argos] API Error:', {
          url,
          error: message,
        });
      }
      throw new Error(message);
    }
  }

  private async refreshApiKey(currentApiKey: string): Promise<string | null> {
    try {
      const response = await this.fetchApi<{ key: string }>(
        '/api-key/refresh',
        {
          method: HttpMethod.POST,
          headers: {
            'x-api-key': currentApiKey,
          },
        }
      );

      return response.success && response.data ? response.data.key : null;
    } catch (error) {
      if (this.debug) {
        console.error('[Argos] Failed to refresh API key:', error);
      }
      return null;
    }
  }
}
