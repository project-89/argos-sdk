import { log } from './logger';

interface StoredData {
  value: string;
  expires: number;
  domain: string;
}

export class SecureStorage {
  private debug: boolean;

  constructor(debug = false) {
    this.debug = debug;
  }

  private encrypt(value: string): string {
    // Simple encryption for demo - in production use a proper encryption library
    return btoa(value);
  }

  private decrypt(value: string): string {
    // Simple decryption for demo - in production use a proper encryption library
    return atob(value);
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() > timestamp;
  }

  private isDomainValid(domain: string): boolean {
    return domain === window.location.hostname;
  }

  set(key: string, value: string, expiresInMinutes = 60): void {
    try {
      const data: StoredData = {
        value: this.encrypt(value),
        expires: Date.now() + expiresInMinutes * 60 * 1000,
        domain: window.location.hostname,
      };

      sessionStorage.setItem(key, JSON.stringify(data));
      if (this.debug) log(this.debug, 'Stored encrypted data for key:', key);
    } catch (error) {
      if (this.debug) log(this.debug, 'Error storing data:', error);
      throw new Error('Failed to store data securely');
    }
  }

  get(key: string): string | null {
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return null;

      const data: StoredData = JSON.parse(stored);

      if (this.isExpired(data.expires)) {
        if (this.debug) log(this.debug, 'Stored data expired for key:', key);
        this.remove(key);
        return null;
      }

      if (!this.isDomainValid(data.domain)) {
        if (this.debug) log(this.debug, 'Domain mismatch for key:', key);
        this.remove(key);
        return null;
      }

      return this.decrypt(data.value);
    } catch (error) {
      if (this.debug) log(this.debug, 'Error retrieving data:', error);
      return null;
    }
  }

  remove(key: string): void {
    sessionStorage.removeItem(key);
    if (this.debug) log(this.debug, 'Removed stored data for key:', key);
  }
}
