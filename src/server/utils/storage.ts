import { Storage } from '../../shared/interfaces/storage';

export class ServerStorage implements Storage {
  private storage: Map<string, string>;
  private prefix: string;

  constructor(prefix: string = '') {
    this.storage = new Map();
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key;
  }

  setItem<T>(key: string, data: T): void {
    this.storage.set(this.getKey(key), JSON.stringify(data));
  }

  getItem<T>(key: string): T | null {
    const stored = this.storage.get(this.getKey(key));
    if (!stored) return null;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    this.storage.delete(this.getKey(key));
  }

  clear(): void {
    this.storage.clear();
  }
}
