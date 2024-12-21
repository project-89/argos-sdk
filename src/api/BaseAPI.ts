import { ApiResponse } from '../types/api';

const getBaseUrl = (configUrl: string) => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:5001';
  }
  return configUrl;
};

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
    this.baseUrl = getBaseUrl(config.baseUrl);
    this.debug = config.debug || false;
    this.apiKey = config.apiKey;
  }

  protected async fetchApi<T>(
    endpoint: string,
    options: RequestInit & { isPublic?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
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

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'include',
        cache: 'no-cache',
        referrerPolicy: 'strict-origin-when-cross-origin',
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.error || `API request failed with status ${response.status}`;

        if (this.debug) {
          console.error('[Argos] Request failed:', {
            url,
            method,
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
          });
        }

        // Handle rate limiting
        if (response.status === 429 && data.retryAfter) {
          const error = new Error(errorMessage) as Error & {
            retryAfter?: number;
          };
          error.retryAfter = data.retryAfter;
          throw error;
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
    } catch (error) {
      if (error instanceof Error) {
        // Enhanced error handling for CORS and connection issues
        if (error.message.includes('Failed to fetch')) {
          throw new Error(
            `Unable to connect to Argos API at ${url}. ` +
              'Please ensure the server is running and CORS is properly configured.'
          );
        }
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }
}
