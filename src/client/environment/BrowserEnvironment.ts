import {
  EnvironmentInterface,
  RuntimeEnvironment,
} from '../../shared/interfaces/environment';
import * as FingerprintJS from '@fingerprintjs/fingerprintjs';
import { CookieStorage } from '../storage/CookieStorage';

export class BrowserEnvironment
  implements EnvironmentInterface<globalThis.Response>
{
  readonly type = RuntimeEnvironment.Browser;
  private apiKey?: string;
  private fingerprintPromise?: Promise<string>;
  private fpAgent?: Promise<FingerprintJS.Agent>;
  private onApiKeyUpdate?: (apiKey: string) => void;
  private storage: CookieStorage;

  constructor(onApiKeyUpdate?: (apiKey: string) => void) {
    if (typeof window === 'undefined') {
      throw new Error(
        'BrowserEnvironment can only be initialized in a browser context'
      );
    }
    this.onApiKeyUpdate = onApiKeyUpdate;
    this.storage = new CookieStorage({
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    this.initializeEnvironment();
  }

  private async initializeEnvironment(): Promise<void> {
    // Restore API key from storage if available
    const storedApiKey = await this.storage.get('api_key');
    if (storedApiKey) {
      this.setApiKey(storedApiKey);
    }
    this.initializeFingerprint();
  }

  private initializeFingerprint(): void {
    if (!this.fpAgent) {
      this.fpAgent = FingerprintJS.load();
      this.fingerprintPromise = this.getInitialFingerprint();
    }
  }

  private async getInitialFingerprint(): Promise<string> {
    if (!this.fpAgent) {
      throw new Error('Fingerprint agent not initialized');
    }
    const agent = await this.fpAgent;
    const result = await agent.get();
    return result.visitorId;
  }

  createHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const result: Record<string, string> = {
      ...headers,
      'content-type': 'application/json',
      'user-agent': this.getUserAgent(),
      'x-api-key': this.apiKey || '',
    };

    return result;
  }

  async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    // Extract rate limit information only if present
    const limit = response.headers.get('x-ratelimit-limit');
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');

    const rateLimitInfo =
      limit && remaining && reset ? { limit, remaining, reset } : undefined;

    if (!response.ok) {
      if (response.status === 401) {
        this.apiKey = undefined;
        await this.storage.remove('api_key');
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        const errorData = isJson
          ? await response.json()
          : await response.text();
        const error = {
          error: 'Rate limit exceeded',
          retryAfter,
          ...(rateLimitInfo ? { rateLimitInfo } : {}),
          details: isJson ? errorData : JSON.parse(errorData),
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
        ...(data.data || data),
        ...(rateLimitInfo ? { rateLimitInfo } : {}),
      } as T;
    }

    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      return {
        ...(parsed.data || parsed),
        ...(rateLimitInfo ? { rateLimitInfo } : {}),
      } as T;
    } catch {
      return {
        data: text,
        ...(rateLimitInfo ? { rateLimitInfo } : {}),
      } as T;
    }
  }

  async getFingerprint(): Promise<string> {
    if (!this.fingerprintPromise) {
      this.initializeFingerprint();
    }

    return this.fingerprintPromise!;
  }

  async getPlatformInfo(): Promise<Record<string, unknown>> {
    return {
      platform: 'browser',
      userAgent: this.getUserAgent(),
      language: navigator.language,
      online: this.isOnline(),
      url: window.location.href,
      referrer: document.referrer,
      runtime: RuntimeEnvironment.Browser,
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

  isOnline(): boolean {
    return navigator.onLine;
  }

  async fetch(url: string, options?: RequestInit): Promise<Response> {
    const headers = {
      ...this.createHeaders(options?.headers as Record<string, string>),
      Origin: window.location.origin,
    };

    const requestOptions = {
      ...options,
      headers,
    };

    if (requestOptions.body && typeof requestOptions.body === 'object') {
      requestOptions.body = JSON.stringify(requestOptions.body);
    }

    return fetch(url, requestOptions);
  }

  getUserAgent(): string {
    return navigator.userAgent;
  }
}
