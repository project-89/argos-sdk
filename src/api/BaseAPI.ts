import { ApiResponse } from '../types/api';

export interface BaseAPIConfig {
  baseUrl: string;
  debug?: boolean;
  apiKey?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';

export class BaseAPI {
  protected baseUrl: string;
  protected debug: boolean;
  protected apiKey?: string;

  constructor(config: BaseAPIConfig) {
    this.baseUrl = config.baseUrl;
    this.debug = config.debug || false;
    this.apiKey = config.apiKey;
  }

  protected async fetchApi<T>(
    endpoint: string,
    options: RequestInit & { isPublic?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    // Since baseUrl already includes /api, just append the endpoint
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const method = (options.method || 'GET') as HttpMethod;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Add API key header for protected endpoints
    if (this.apiKey && !options.isPublic) {
      headers['x-api-key'] = this.apiKey;
    }

    if (this.debug) {
      console.log('[Argos] API Request:', {
        url,
        method,
        headers: {
          ...headers,
          'x-api-key': this.apiKey ? '[REDACTED]' : undefined,
        },
        body: options.body ? JSON.parse(options.body as string) : undefined,
      });
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
          method,
          error: networkError,
        });
      }
      // Enhanced error handling for CORS and connection issues
      if (networkError instanceof Error) {
        if (networkError.message.includes('Failed to fetch')) {
          throw new Error(
            `Unable to connect to Argos API at ${url}. ` +
              'Please ensure the server is running and CORS is properly configured.'
          );
        }
        throw networkError;
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
          method,
          status: response.status,
          statusText: response.statusText,
          error: parseError,
        });
      }
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      // Log the full error response in debug mode
      if (this.debug) {
        console.error('[Argos] Request failed:', {
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          error: data.error || data.message,
          data,
          body: options.body ? JSON.parse(options.body as string) : undefined,
        });
      }

      // Handle rate limiting
      if (response.status === 429 && data.retryAfter) {
        const error = new Error(
          data.error || 'Rate limit exceeded'
        ) as Error & {
          retryAfter?: number;
        };
        error.retryAfter = data.retryAfter;
        throw error;
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        if (this.debug) {
          console.error('[Argos] Resource not found:', {
            url,
            method,
            data,
          });
        }
        throw new Error('Not Found');
      }

      // Handle unauthorized
      if (response.status === 401) {
        if (this.debug) {
          console.error('[Argos] Unauthorized:', {
            url,
            method,
            data,
          });
        }
        throw new Error('Unauthorized');
      }

      // Handle forbidden
      if (response.status === 403) {
        if (this.debug) {
          console.error('[Argos] Forbidden:', {
            url,
            method,
            data,
          });
        }
        throw new Error('Forbidden');
      }

      // Handle other errors
      const errorMessage =
        data.error ||
        data.message ||
        `API request failed with status ${response.status}`;
      if (this.debug) {
        console.error('[Argos] Error response:', {
          url,
          method,
          status: response.status,
          message: errorMessage,
          data,
        });
      }
      throw new Error(errorMessage);
    }

    if (this.debug) {
      console.log('[Argos] API Response:', {
        url,
        method,
        status: response.status,
        data,
      });
    }

    return data as ApiResponse<T>;
  }
}
