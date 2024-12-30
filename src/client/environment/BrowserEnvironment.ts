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
  private fingerprintPromise: Promise<string>;
  private fpAgent: Promise<FingerprintJS.Agent>;
  private onApiKeyUpdate?: (apiKey: string) => void;

  constructor(onApiKeyUpdate?: (apiKey: string) => void) {
    this.fpAgent = FingerprintJS.load();
    this.fingerprintPromise = this.initializeFingerprint();
    this.onApiKeyUpdate = onApiKeyUpdate;
  }

  private async initializeFingerprint(): Promise<string> {
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

    return this.fingerprintPromise;
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
    console.log('Making request to:', url);
    console.log('Request options:', JSON.stringify(options, null, 2));

    const headers = {
      ...options?.headers,
      Origin: window.location.origin,
    };

    if (options?.body && typeof options.body === 'object') {
      options = {
        ...options,
        headers,
        body: JSON.stringify(options.body),
      };
    } else {
      options = {
        ...options,
        headers,
      };
    }
    return fetch(url, options);
  }

  getUserAgent(): string {
    return navigator.userAgent;
  }
}
