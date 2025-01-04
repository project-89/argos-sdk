import {
  EnvironmentInterface,
  RuntimeEnvironment,
} from '../../shared/interfaces/environment';
import type { Response, RequestInit } from 'node-fetch';
import { SecureStorage } from '../storage/SecureStorage';

export class NodeEnvironment
  implements EnvironmentInterface<Response, RequestInit>
{
  readonly type = RuntimeEnvironment.Node;
  private apiKey?: string;
  private storage: SecureStorage;
  private onApiKeyUpdate?: (apiKey: string) => void;

  constructor(
    encryptionKeyOrStorage: string | SecureStorage,
    onApiKeyUpdate?: (apiKey: string) => void
  ) {
    this.storage =
      typeof encryptionKeyOrStorage === 'string'
        ? new SecureStorage({ encryptionKey: encryptionKeyOrStorage })
        : encryptionKeyOrStorage;
    this.onApiKeyUpdate = onApiKeyUpdate;
    this.initializeEnvironment();
  }

  private async initializeEnvironment(): Promise<void> {
    // Restore API key from storage if available
    const storedApiKey = await this.storage.get('api_key');
    if (storedApiKey) {
      this.setApiKey(storedApiKey);
    }
  }

  createHeaders(
    headers: Record<string, string> = {},
    fingerprint?: string
  ): Record<string, string> {
    const baseHeaders: Record<string, string> = {
      'content-type': 'application/json',
      'user-agent': this.getUserAgent(),
      'x-api-key': this.getApiKey() || '',
    };

    if (fingerprint) {
      baseHeaders['x-fingerprint'] = fingerprint;
    }

    return {
      ...baseHeaders,
      ...headers,
    };
  }

  async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers?.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    // Extract rate limit information only if present
    const limit = response.headers?.get('X-RateLimit-Limit');
    const rateLimitInfo = limit
      ? {
          limit,
          remaining: response.headers?.get('X-RateLimit-Remaining') || '0',
          reset:
            response.headers?.get('X-RateLimit-Reset') || Date.now().toString(),
        }
      : undefined;

    if (!response.ok) {
      if (response.status === 401) {
        this.apiKey = undefined;
        await this.storage.remove('api_key');
      }
      if (response.status === 429) {
        const retryAfter = response.headers?.get('Retry-After') || '60';
        const errorData = isJson
          ? await response.json()
          : await response.text();
        const error = {
          error: 'Rate limit exceeded',
          retryAfter,
          rateLimitInfo: {
            limit: response.headers?.get('X-RateLimit-Limit') || '1000',
            remaining: '0',
            reset: retryAfter,
          },
          details: errorData,
        };
        throw new Error(JSON.stringify(error));
      }
      const errorData = isJson ? await response.json() : await response.text();
      throw new Error(
        typeof errorData === 'string' ? errorData : JSON.stringify(errorData)
      );
    }

    if (isJson) {
      const data = await response.json();
      return {
        ...data,
        ...(rateLimitInfo ? { rateLimitInfo } : {}),
      } as T;
    }

    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        ...(rateLimitInfo ? { rateLimitInfo } : {}),
      } as T;
    } catch {
      return {
        data: text,
        ...(rateLimitInfo ? { rateLimitInfo } : {}),
      } as T;
    }
  }

  async getPlatformInfo(): Promise<Record<string, unknown>> {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      userAgent: this.getUserAgent(),
      language: this.getLanguage(),
      online: this.isOnline(),
      url: this.getUrl(),
      referrer: this.getReferrer(),
      runtime: RuntimeEnvironment.Node,
    };
  }

  async setApiKey(apiKey: string): Promise<void> {
    if (!apiKey) {
      throw new Error('API key cannot be empty');
    }
    this.apiKey = apiKey;
    await this.storage.set('api_key', apiKey);
    if (this.onApiKeyUpdate) {
      this.onApiKeyUpdate(apiKey);
    }
  }

  getApiKey(): string | undefined {
    return this.apiKey;
  }

  getUserAgent(): string {
    return `Node.js/${process.version}`;
  }

  getLanguage(): string {
    return process.env.LANG || 'en-US';
  }

  getUrl(): string | null {
    return null;
  }

  getReferrer(): string | null {
    return null;
  }

  isOnline(): boolean {
    return true;
  }

  async fetch(
    url: string,
    options: RequestInit & { fingerprint?: string }
  ): Promise<Response> {
    const { default: nodeFetch } = await import('node-fetch');
    const headers = this.createHeaders(
      (options.headers as Record<string, string>) || {},
      options.fingerprint
    );

    const requestOptions = {
      ...options,
      headers,
    };

    if (requestOptions.body && typeof requestOptions.body === 'object') {
      requestOptions.body = JSON.stringify(requestOptions.body);
    }

    return nodeFetch(url, requestOptions);
  }
}
