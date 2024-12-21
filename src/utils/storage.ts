import { log } from './logger';

interface StoredData {
  value: string;
  expires: number;
}

export class SecureStorage {
  private debug: boolean;
  private prefix = 'argos_sdk_';

  constructor(debug = false) {
    this.debug = debug;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() > timestamp;
  }

  set(key: string, value: string, expiresInMinutes = 60): void {
    try {
      const data: StoredData = {
        value,
        expires: Date.now() + expiresInMinutes * 60 * 1000,
      };

      sessionStorage.setItem(this.getKey(key), JSON.stringify(data));
      if (this.debug) log(this.debug, 'Stored data for key:', key);
    } catch (error) {
      if (this.debug) log(this.debug, 'Error storing data:', error);
      throw new Error('Failed to store data');
    }
  }

  get(key: string): string | null {
    try {
      const stored = sessionStorage.getItem(this.getKey(key));
      if (!stored) return null;

      const data: StoredData = JSON.parse(stored);

      if (this.isExpired(data.expires)) {
        if (this.debug) log(this.debug, 'Stored data expired for key:', key);
        this.remove(key);
        return null;
      }

      return data.value;
    } catch (error) {
      if (this.debug) log(this.debug, 'Error retrieving data:', error);
      return null;
    }
  }

  remove(key: string): void {
    sessionStorage.removeItem(this.getKey(key));
    if (this.debug) log(this.debug, 'Removed stored data for key:', key);
  }

  listKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return keys;
  }
}
