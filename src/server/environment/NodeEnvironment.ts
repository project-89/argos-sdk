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
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

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
