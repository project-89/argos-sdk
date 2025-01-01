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

  constructor(config: BaseAPIConfig<T, R>) {
    this.baseUrl = config.baseUrl;
    this.environment = config.environment;
    this.maxRequestsPerMinute = config.maxRequestsPerMinute || Infinity;
    this.maxRequestsPerHour = config.maxRequestsPerHour || Infinity;
    if (config.apiKey) {
      this.environment.setApiKey(config.apiKey);
    }
  }

  protected async fetchApi<U>(
    path: string,
    options?: BaseAPIRequestOptions
  ): Promise<ApiResponse<U>> {
    const url = `${this.baseUrl}${path}`;
    const headers = this.environment.createHeaders(options?.headers || {});
    const requestOptions = {
      ...options,
      headers,
    } as R;
    const response = await this.environment.fetch(url, requestOptions);
    return this.environment.handleResponse(response);
  }

  protected createHeaders(
    options?: BaseAPIRequestOptions
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!options?.skipAuth) {
      const apiKey = this.environment.getApiKey();
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }
    }

    if (options?.body) {
      headers['content-type'] = 'application/json';
    }

    return {
      ...headers,
      ...this.environment.createHeaders(headers),
    };
  }
}
