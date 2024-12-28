import { StorageInterface } from '../../shared/interfaces/environment';
import Cookies from 'js-cookie';

export interface CookieStorageOptions {
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
  path?: string;
}

export class CookieStorage implements StorageInterface {
  private options: CookieStorageOptions;
  private readonly prefix = 'argos_';

  constructor(options: CookieStorageOptions = {}) {
    this.options = {
      secure: true,
      sameSite: 'strict',
      ...options,
    };
  }

  private getPrefixedKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  getItem(key: string): string | null {
    if (typeof document === 'undefined') {
      return null;
    }
    return Cookies.get(this.getPrefixedKey(key)) ?? null;
  }

  setItem(key: string, value: string): void {
    if (typeof document === 'undefined') {
      return;
    }
    Cookies.set(this.getPrefixedKey(key), value, {
      ...this.options,
      expires: 7, // 7 days
    });
  }

  removeItem(key: string): void {
    if (typeof document === 'undefined') {
      return;
    }
    Cookies.remove(this.getPrefixedKey(key), this.options);
  }

  clear(): void {
    if (typeof document === 'undefined') {
      return;
    }
    const cookies = Cookies.get();
    Object.keys(cookies).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        Cookies.remove(key, this.options);
      }
    });
  }
}
