import {
  EnvironmentInterface,
  RuntimeEnvironment,
} from '../../shared/interfaces/environment';
import { StorageInterface } from '../../shared/interfaces/environment';

export class BrowserEnvironment implements EnvironmentInterface {
  private storage: StorageInterface;
  private onApiKeyUpdate?: (apiKey: string) => void;

  constructor(
    storage: StorageInterface,
    onApiKeyUpdate?: (apiKey: string) => void
  ) {
    this.storage = storage;
    this.onApiKeyUpdate = onApiKeyUpdate;
  }

  setApiKey(apiKey: string): void {
    if (!apiKey) {
      throw new Error('API key cannot be empty');
    }
    this.storage.setItem('apiKey', apiKey);
    if (this.onApiKeyUpdate) {
      this.onApiKeyUpdate(apiKey);
    }
  }

  getApiKey(): string | undefined {
    return this.storage.getItem('apiKey') || undefined;
  }

  createHeaders(headers: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {
      ...headers,
      'content-type': 'application/json',
      'user-agent': this.getUserAgent(),
    };

    const apiKey = this.getApiKey();
    if (apiKey) {
      result['x-api-key'] = apiKey;
    }

    return result;
  }

  async handleResponse(response: Response): Promise<Response> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      if (response.status === 401) {
        // Handle API key invalidation
        this.storage.removeItem('apiKey');
      }
      const errorData = isJson ? await response.json() : await response.text();
      throw new Error(
        typeof errorData === 'string' ? errorData : JSON.stringify(errorData)
      );
    }

    return isJson ? response.json() : response.text();
  }

  getUserAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : '';
  }

  getUrl(): string | null {
    return typeof window !== 'undefined' ? window.location.href : null;
  }

  getReferrer(): string | null {
    return typeof document !== 'undefined' ? document.referrer : null;
  }

  getLanguage(): string {
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  }

  async getPlatformInfo(): Promise<Record<string, unknown>> {
    return {
      platform: 'browser',
      userAgent: this.getUserAgent(),
      language: this.getLanguage(),
      online: this.isOnline(),
      url: this.getUrl(),
      referrer: this.getReferrer(),
      runtime: RuntimeEnvironment.Browser,
    };
  }

  async getFingerprint(): Promise<string> {
    const fingerprint = this.storage.getItem('fingerprint');
    if (fingerprint) {
      return fingerprint;
    }

    // Generate a new fingerprint
    const newFingerprint = crypto.randomUUID();
    this.storage.setItem('fingerprint', newFingerprint);
    return newFingerprint;
  }

  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  async fetch(url: string, init?: RequestInit): Promise<Response> {
    return fetch(url, init);
  }
}
