import { Storage } from '../../shared/interfaces/storage';

export class BrowserStorage implements Storage {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key;
  }

  setItem<T>(key: string, data: T): void {
    sessionStorage.setItem(this.getKey(key), JSON.stringify(data));
  }

  getItem<T>(key: string): T | null {
    const stored = sessionStorage.getItem(this.getKey(key));
    if (!stored) return null;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        sessionStorage.removeItem(key);
      }
    }
  }
}
