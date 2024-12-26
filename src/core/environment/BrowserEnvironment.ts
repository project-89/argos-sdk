import { EnvironmentInterface } from '../interfaces/environment';

export class BrowserEnvironment implements EnvironmentInterface {
  private debug: boolean;

  constructor(config: { debug?: boolean } = {}) {
    this.debug = config.debug || false;
  }

  async getFingerprint(): Promise<string> {
    // This is a placeholder - you should implement proper fingerprinting
    return 'browser-' + Math.random().toString(36).substring(2);
  }

  getPlatformInfo(): string {
    return navigator.platform;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  getLanguage(): string {
    return navigator.language;
  }

  getUserAgent(): string {
    return navigator.userAgent;
  }

  getUrl(): string | null {
    return window.location.href;
  }

  getReferrer(): string | null {
    return document.referrer;
  }

  createHeaders(headers: Record<string, string>): Headers {
    return new Headers(headers);
  }

  async handleResponse(response: Response): Promise<any> {
    const data = await response.json();
    return data;
  }
}
