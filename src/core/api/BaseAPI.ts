import { ApiResponse, RequestOptions, SDKConfig } from '../types';

export class BaseAPI {
  protected baseUrl: string;
  protected debug: boolean;
  protected apiKey?: string;

  constructor(config: SDKConfig & { apiKey?: string }) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.debug = config.debug || false;
    this.apiKey = config.apiKey;
  }

  protected async fetchApi<T>(
    endpoint: string,
    options: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add API key if available
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'include',
        cache: 'no-cache',
        referrerPolicy: 'strict-origin-when-cross-origin',
      });
    } catch (networkError) {
      if (this.debug) {
        console.error('[Argos] Network error:', {
          url,
          method: options.method,
          error: networkError,
        });
      }
      throw new Error('Network request failed');
    }

    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      if (this.debug) {
        console.error('[Argos] JSON parse error:', {
          url,
          method: options.method,
          status: response.status,
          statusText: response.statusText,
          error: parseError,
        });
      }
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      if (this.debug) {
        console.error('[Argos] Request failed:', {
          url,
          method: options.method,
          status: response.status,
          statusText: response.statusText,
          error: data.error || data.message,
          data,
        });
      }

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }

      throw new Error(data.error || data.message || 'Request failed');
    }

    return data;
  }
}
