import { StorageInterface } from '../../shared/interfaces/environment';
import Cookies from 'js-cookie';

export interface CookieStorageOptions {
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
  path?: string;
  expires?: number;
}

export class CookieStorage implements StorageInterface {
  private prefix: string;
  private options: CookieStorageOptions;

  constructor(options: CookieStorageOptions = {}) {
    this.prefix = 'argos_';
    this.options = {
      secure: true,
      sameSite: 'strict',
      path: '/',
      ...options,
    };
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get(key: string): Promise<string | null> {
    const prefixedKey = this.getKey(key);
    const value = Cookies.get(prefixedKey);
    return value === undefined ? null : value;
  }

  async set(key: string, value: string): Promise<void> {
    const prefixedKey = this.getKey(key);
    const cookieOptions = {
      ...this.options,
      expires: this.options.expires ? this.options.expires : undefined,
    };

    // Handle empty string case
    if (value === '') {
      Cookies.set(prefixedKey, value, cookieOptions);
      return;
    }

    try {
      Cookies.set(prefixedKey, value, cookieOptions);
    } catch (error) {
      console.error('Failed to set cookie:', error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    const prefixedKey = this.getKey(key);
    const removeOptions = {
      ...this.options,
      expires: undefined,
    };

    try {
      Cookies.remove(prefixedKey, removeOptions);
    } catch (error) {
      console.error('Failed to remove cookie:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    const cookies = Cookies.get();
    Object.keys(cookies).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        try {
          Cookies.remove(key, {
            ...this.options,
            expires: undefined,
          });
        } catch (error) {
          console.error(`Failed to remove cookie ${key}:`, error);
        }
      }
    });
  }
}
