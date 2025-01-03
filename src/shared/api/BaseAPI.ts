import { ApiResponse } from '../interfaces/api';
import { EnvironmentInterface } from '../interfaces/environment';
import { CommonResponse, CommonRequestInit } from '../interfaces/http';

export interface BaseAPIConfig<
  T extends CommonResponse,
  R extends CommonRequestInit
> {
  baseUrl: string;
  environment: EnvironmentInterface<T, R>;
  apiKey?: string;
  debug?: boolean;
  maxRequestsPerMinute?: number;
  maxRequestsPerHour?: number;
}

export interface BaseAPIRequestOptions {
  method: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  integrity?: string;
  keepalive?: boolean;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  window?: null;
  skipAuth?: boolean;
}

export class BaseAPI<T extends CommonResponse, R extends CommonRequestInit> {
  protected baseUrl: string;
  protected environment: EnvironmentInterface<T, R>;
  protected maxRequestsPerMinute: number;
  protected maxRequestsPerHour: number;

  // List of endpoints that don't require authentication
  protected publicEndpoints = new Set([
    '/fingerprint/register', // Register fingerprint
    '/api-key/register', // Register API key
    '/api-key/validate', // Validate API key
    '/health', // Health check
    '/price/current', // Get current prices
    '/role/available', // Get available roles
  ]);

  constructor(config: BaseAPIConfig<T, R>) {
    this.baseUrl = config.baseUrl;
    this.environment = config.environment;
    this.maxRequestsPerMinute = config.maxRequestsPerMinute || Infinity;
    this.maxRequestsPerHour = config.maxRequestsPerHour || Infinity;
    if (config.apiKey) {
      this.environment.setApiKey(config.apiKey);
    }
  }

  protected isPublicEndpoint(path: string): boolean {
    return this.publicEndpoints.has(path);
  }

  protected async fetchApi<U>(
    path: string,
    options?: BaseAPIRequestOptions
  ): Promise<ApiResponse<U>> {
    const url = `${this.baseUrl}${path}`;
    const isPublic = this.isPublicEndpoint(path);
    const headers = this.createHeaders(options, isPublic);
    const requestOptions = {
      ...options,
      headers,
      signal: options?.signal,
    } as R;

    try {
      const response = await this.environment.fetch(url, requestOptions);
      return this.environment.handleResponse(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    }
  }

  protected createHeaders(
    options?: BaseAPIRequestOptions,
    isPublic = false
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'user-agent': this.environment.getUserAgent(),
    };

    // Add API key for authenticated endpoints
    if (!isPublic) {
      const apiKey = this.environment.getApiKey();
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }
    }

    // Add any custom headers
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    return headers;
  }
}
