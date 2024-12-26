import { EnvironmentInterface } from '../../core/interfaces/environment';
import { randomUUID } from 'crypto';

export class ServerEnvironment implements EnvironmentInterface {
  private debug: boolean;
  private customUserAgent?: string;
  private customUrl?: string;
  private customReferrer?: string;
  private customLanguage?: string;
  private customPlatform?: string;

  constructor(
    config: {
      debug?: boolean;
      userAgent?: string;
      url?: string;
      referrer?: string;
      language?: string;
      platform?: string;
    } = {}
  ) {
    this.debug = config.debug || false;
    this.customUserAgent = config.userAgent;
    this.customUrl = config.url;
    this.customReferrer = config.referrer;
    this.customLanguage = config.language;
    this.customPlatform = config.platform;
  }

  async getFingerprint(): Promise<string> {
    return randomUUID();
  }

  getPlatformInfo(): string {
    if (this.customPlatform) {
      return this.customPlatform;
    }
    return process.platform || 'unknown';
  }

  isOnline(): boolean {
    return true;
  }

  getLanguage(): string {
    if (this.customLanguage) {
      return this.customLanguage;
    }
    return process.env.LANG || 'en-US';
  }

  getUserAgent(): string {
    if (this.customUserAgent) {
      return this.customUserAgent;
    }
    return `ArgosSDK/Server (${process.platform}; ${process.version})`;
  }

  getUrl(): string | null {
    return this.customUrl || null;
  }

  getReferrer(): string | null {
    return this.customReferrer || null;
  }

  createHeaders(headers: Record<string, string>): Record<string, string> {
    // In Node.js, we just use a plain object for headers
    return { ...headers };
  }

  async handleResponse(response: Response): Promise<any> {
    const data = await response.json();
    return data;
  }
}
