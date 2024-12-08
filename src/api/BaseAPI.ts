import { ApiResponse } from '../types/api';

export interface BaseAPIConfig {
  baseUrl: string;
  apiKey: string;
}

export class BaseAPI {
  private static baseUrl: string;
  private static apiKey: string;

  constructor(config?: BaseAPIConfig | string) {
    if (config) {
      if (typeof config === 'string') {
        BaseAPI.initialize({ baseUrl: '', apiKey: config });
      } else {
        BaseAPI.initialize(config);
      }
    }
  }

  public static initialize(config: BaseAPIConfig) {
    BaseAPI.baseUrl = config.baseUrl;
    BaseAPI.apiKey = config.apiKey;
  }

  protected async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (!BaseAPI.baseUrl || !BaseAPI.apiKey) {
      throw new Error('BaseAPI not initialized. Call initialize() first.');
    }

    const url = `${BaseAPI.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': BaseAPI.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return {
        success: true,
        data: data.data as T,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }
}
