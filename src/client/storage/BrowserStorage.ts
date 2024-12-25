import { StorageInterface } from '../../core/interfaces/environment';

interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export class BrowserStorage implements StorageInterface {
  private readonly prefix: string;
  private debug: boolean;
  private readonly defaultOptions: CookieOptions;

  constructor(prefix: string = 'argos_', debug: boolean = false) {
    this.prefix = prefix;
    this.debug = debug;
    this.defaultOptions = {
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'lax',
      // Cookie expiry set to 30 days
      maxAge: 30 * 24 * 60 * 60,
    };
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const cookieName = `${this.prefix}${name}=`;

    if (this.debug) {
      console.log('[Argos] Getting cookie:', {
        name: this.prefix + name,
        allCookies: cookies.map((c) => c.trim()),
      });
    }

    for (const cookie of cookies) {
      const c = cookie.trim();
      if (c.startsWith(cookieName)) {
        const value = decodeURIComponent(c.substring(cookieName.length));
        if (this.debug) {
          console.log('[Argos] Found cookie:', {
            name: this.prefix + name,
            hasValue: !!value,
            value: value.substring(0, 10) + '...',
          });
        }
        return value;
      }
    }

    if (this.debug) {
      console.log('[Argos] Cookie not found:', this.prefix + name);
    }
    return null;
  }

  private setCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
  ): void {
    if (typeof document === 'undefined') return;

    const mergedOptions = { ...this.defaultOptions, ...options };
    let cookieString = `${this.prefix}${name}=${encodeURIComponent(value)}`;

    if (mergedOptions.path) {
      cookieString += `;path=${mergedOptions.path}`;
    }
    if (mergedOptions.domain) {
      cookieString += `;domain=${mergedOptions.domain}`;
    }
    if (typeof mergedOptions.maxAge === 'number') {
      cookieString += `;max-age=${mergedOptions.maxAge}`;
      const expiresDate = new Date(Date.now() + mergedOptions.maxAge * 1000);
      cookieString += `;expires=${expiresDate.toUTCString()}`;
    }
    if (mergedOptions.secure) {
      cookieString += ';secure';
    }
    if (mergedOptions.sameSite) {
      cookieString += `;samesite=${mergedOptions.sameSite}`;
    }

    if (this.debug) {
      console.log('[Argos] Setting cookie:', {
        name: this.prefix + name,
        hasValue: !!value,
        value: value.substring(0, 10) + '...',
        cookieString,
        options: mergedOptions,
      });
    }

    document.cookie = cookieString;

    // Verify the cookie was set
    const verifyValue = this.getCookie(name);
    if (this.debug) {
      console.log('[Argos] Cookie set verification:', {
        name: this.prefix + name,
        wasSet: !!verifyValue,
        matches: verifyValue === value,
      });
    }
  }

  getItem(key: string): string | null {
    if (this.debug) {
      console.log('[Argos] Getting storage item:', { key });
    }
    const value = this.getCookie(key);
    if (this.debug) {
      console.log('[Argos] Got storage item:', { key, hasValue: !!value });
    }
    return value;
  }

  setItem(key: string, value: string): void {
    if (this.debug) {
      console.log('[Argos] Setting storage item:', { key, hasValue: !!value });
    }
    this.setCookie(key, value);
  }

  removeItem(key: string): void {
    if (this.debug) {
      console.log('[Argos] Removing storage item:', { key });
    }
    this.setCookie(key, '', { maxAge: -1 });
  }

  clear(): void {
    if (typeof document === 'undefined') return;

    if (this.debug) {
      console.log('[Argos] Clearing all storage items');
    }
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith(this.prefix)) {
        const key = cookieName.substring(this.prefix.length);
        if (this.debug) {
          console.log('[Argos] Clearing storage item:', { key });
        }
        this.removeItem(key);
      }
    }
  }
}
