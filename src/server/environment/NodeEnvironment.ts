import {
  EnvironmentInterface,
  RuntimeEnvironment,
} from '../../shared/interfaces/environment';
import { SecureStorage } from '../storage/SecureStorage';
import * as os from 'os';
import { createHash } from 'crypto';
import fetch from 'node-fetch';
import type {
  Response as NodeResponse,
  RequestInit as NodeRequestInit,
} from 'node-fetch';

export class NodeEnvironment implements EnvironmentInterface<NodeResponse> {
  private storage: SecureStorage;
  private onApiKeyUpdate?: (apiKey: string) => void;

  constructor(
    storage: SecureStorage,
    onApiKeyUpdate?: (apiKey: string) => void
  ) {
    this.storage = storage;
    this.onApiKeyUpdate = onApiKeyUpdate;
  }

  isOnline(): boolean {
    // In Node.js, we assume we're online unless proven otherwise
    return true;
  }

  getUserAgent(): string {
    return `Node.js/${process.version} (${os.platform()}; ${os.arch()})`;
  }

  getLanguage(): string {
    return process.env.LANG || 'en-US';
  }

  async getPlatformInfo(): Promise<Record<string, unknown>> {
    return {
      platform: 'node',
      osType: os.platform(),
      arch: os.arch(),
      version: process.version,
      userAgent: this.getUserAgent(),
      language: this.getLanguage(),
      online: this.isOnline(),
      runtime: RuntimeEnvironment.Node,
    };
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
    const result = { ...headers };
    const apiKey = this.getApiKey();
    if (apiKey) {
      result['x-api-key'] = apiKey;
    }
    result['user-agent'] = this.getUserAgent();
    result['content-type'] = 'application/json';
    return result;
  }

  async handleResponse(response: NodeResponse): Promise<unknown> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      if (response.status === 401) {
        this.storage.removeItem('apiKey');
      }
      const errorData = isJson ? await response.json() : await response.text();
      throw new Error(
        typeof errorData === 'string' ? errorData : JSON.stringify(errorData)
      );
    }

    return isJson ? response.json() : response.text();
  }

  getUrl(): string | null {
    return null;
  }

  getReferrer(): string | null {
    return null;
  }

  async getFingerprint(): Promise<string> {
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpuModel: os.cpus()[0]?.model || 'unknown',
      cpuCount: os.cpus().length,
      totalMem: os.totalmem(),
      hostname: os.hostname(),
    };

    const hash = createHash('sha256')
      .update(JSON.stringify(systemInfo))
      .digest('hex');

    return `node-${hash}`;
  }

  async fetch(url: string, init?: RequestInit): Promise<NodeResponse> {
    const response = await fetch(url, init as NodeRequestInit);
    return response;
  }
}
