import { EnvironmentInterface } from '../../core/interfaces/environment';
import * as fpjs from '@fingerprintjs/fingerprintjs';

export class BrowserEnvironment implements EnvironmentInterface {
  private debug: boolean;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  async getFingerprint(): Promise<string> {
    try {
      // Initialize an agent at application startup.
      const fpAgent = await fpjs.load();

      // Get the visitor identifier when you need it.
      const result = await fpAgent.get();

      // Use the visitor identifier as a stable identifier of the browser.
      return result.visitorId;
    } catch (err) {
      if (this.debug) {
        console.error('Error getting browser fingerprint:', err);
      }
      // Fallback to UUID if fingerprinting fails
      return crypto.randomUUID();
    }
  }

  getPlatformInfo(): string {
    if (typeof navigator === 'undefined') return 'unknown';

    // Try modern API first
    if ('userAgentData' in navigator && navigator.userAgentData?.platform) {
      return navigator.userAgentData.platform;
    }

    // Fallback to user agent parsing
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod'))
      return 'iOS';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('linux')) return 'Linux';

    return 'unknown';
  }

  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  getLanguage(): string {
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
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
}
