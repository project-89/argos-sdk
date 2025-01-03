import {
  EnvironmentInterface,
  RuntimeEnvironment,
} from '../../shared/interfaces/environment';
import * as FingerprintJS from '@fingerprintjs/fingerprintjs';

export class BrowserEnvironment
  implements EnvironmentInterface<globalThis.Response>
{
  readonly type = RuntimeEnvironment.Browser;
  private apiKey?: string;
  private fingerprintPromise?: Promise<string>;
  private fpAgent?: Promise<FingerprintJS.Agent>;
  private onApiKeyUpdate?: (apiKey: string) => void;

  constructor(onApiKeyUpdate?: (apiKey: string) => void) {
    if (typeof window === 'undefined') {
      throw new Error(
        'BrowserEnvironment can only be initialized in a browser context'
      );
    }
    this.onApiKeyUpdate = onApiKeyUpdate;
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

    if (!response.ok) {
      if (response.status === 401) {
        this.apiKey = undefined;
      }
      const errorData = isJson ? await response.json() : await response.text();
      throw new Error(
        typeof errorData === 'string' ? errorData : JSON.stringify(errorData)
      );
    }

    if (isJson) {
      const data = await response.json();
      return data;
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text as unknown as T;
    }
  }

  async getFingerprint(): Promise<string> {
    if (process.env.NODE_ENV === 'test') {
      return 'test-fingerprint';
    }

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

  setApiKey(apiKey: string): void {
    if (!apiKey) {
      throw new Error('API key cannot be empty');
    }
    this.apiKey = apiKey;
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
