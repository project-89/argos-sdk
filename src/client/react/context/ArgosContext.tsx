import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { ArgosClientSDK as ArgosSDK } from '../../../client/sdk/ArgosClientSDK';
import type { ClientSDKConfig as ArgosSDKConfig } from '../../../client/sdk/ArgosClientSDK';
import { Fingerprint } from '../../../shared/interfaces/api';
import { log } from '../../../shared/utils/logger';
import * as fpjs from '@fingerprintjs/fingerprintjs';

// Add CookieOptions interface
interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

// Replace SecureStorage class with CookieStorage
class CookieStorage {
  private static instance: CookieStorage;
  private readonly prefix = 'argos_';
  private debug: boolean;
  private readonly defaultOptions: CookieOptions = {
    path: '/',
    secure: true,
    sameSite: 'strict',
    // Cookie expiry set to 30 days
    maxAge: 30 * 24 * 60 * 60,
  };

  private constructor() {
    this.debug = false;
  }

  static getInstance(): CookieStorage {
    if (!CookieStorage.instance) {
      CookieStorage.instance = new CookieStorage();
    }
    return CookieStorage.instance;
  }

  setDebug(enabled: boolean): void {
    this.debug = enabled;
  }

  private getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');
    const cookieName = `${this.prefix}${name}=`;

    log(this.debug, 'Getting cookie:', {
      name: this.prefix + name,
      allCookies: cookies.map((c) => c.trim()),
    });

    for (const cookie of cookies) {
      const c = cookie.trim();
      if (c.startsWith(cookieName)) {
        const value = decodeURIComponent(c.substring(cookieName.length));
        log(this.debug, 'Found cookie:', {
          name: this.prefix + name,
          hasValue: !!value,
          value: value.substring(0, 10) + '...',
        });
        return value;
      }
    }

    log(this.debug, 'Cookie not found:', this.prefix + name);
    return null;
  }

  private setCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
  ): void {
    // Ensure we're in a secure context before setting cookies
    if (!window.isSecureContext) {
      console.warn('Attempting to set cookie in non-secure context');
      return;
    }

    const mergedOptions = { ...this.defaultOptions, ...options };
    // Force secure and SameSite in production
    if (process.env.NODE_ENV === 'production') {
      mergedOptions.secure = true;
      mergedOptions.sameSite = 'strict';
    }

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

    log(this.debug, 'Setting cookie:', {
      name: this.prefix + name,
      hasValue: !!value,
      value: value.substring(0, 10) + '...',
      cookieString,
      options: mergedOptions,
    });

    document.cookie = cookieString;

    // Verify the cookie was set
    const verifyValue = this.getCookie(name);
    if (!verifyValue) {
      console.warn('Failed to set cookie:', name);
    }
    log(this.debug, 'Cookie set verification:', {
      name: this.prefix + name,
      wasSet: !!verifyValue,
      matches: verifyValue === value,
    });
  }

  setItem(key: string, value: string): void {
    log(this.debug, 'Setting storage item:', { key, hasValue: !!value });
    this.setCookie(key, value);
  }

  getItem(key: string): string | null {
    log(this.debug, 'Getting storage item:', { key });
    const value = this.getCookie(key);
    log(this.debug, 'Got storage item:', { key, hasValue: !!value });
    return value;
  }

  removeItem(key: string): void {
    log(this.debug, 'Removing storage item:', { key });
    this.setCookie(key, '', { maxAge: -1 });
  }

  clear(): void {
    log(this.debug, 'Clearing all storage items');
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith(this.prefix)) {
        const key = cookieName.substring(this.prefix.length);
        log(this.debug, 'Clearing storage item:', { key });
        this.removeItem(key);
      }
    }
  }
}

const secureStorage = CookieStorage.getInstance();

const STORAGE_KEYS = {
  FINGERPRINT_ID: 'fingerprint_id',
  API_KEY: 'api_key',
} as const;

export interface ArgosContextType {
  sdk: ArgosSDK;
  isOnline: boolean;
  fingerprintId: string | null;
  fingerprint: Fingerprint | null;
  isLoading: boolean;
  error: Error | null;
}

export interface ArgosProviderProps {
  children: React.ReactNode;
  config: ArgosSDKConfig;
  onError?: (error: Error) => void;
  debug?: boolean;
}

export const ArgosContext = createContext<ArgosContextType | null>(null);

export function ArgosProvider({
  config,
  children,
  onError,
  debug = false,
}: ArgosProviderProps) {
  const [sdk] = useState(() => new ArgosSDK({ ...config, debug }));
  const [isOnline, setIsOnline] = useState(sdk.isOnline());
  const [fingerprintId, setFingerprintId] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<Fingerprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleError = useCallback(
    (err: unknown) => {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      onError?.(errorObj);
      log(debug, 'Error:', errorObj);
    },
    [onError, debug]
  );

  const getPlatformInfo = useCallback(() => {
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
  }, []);

  const refreshApiKey = useCallback(async () => {
    try {
      if (!fingerprintId) {
        throw new Error('No fingerprint ID available');
      }

      log(debug, 'Refreshing API key');
      const apiKeyResponse = await sdk.registerApiKey(fingerprintId);

      if (!apiKeyResponse.success || !apiKeyResponse.data) {
        throw new Error('Failed to refresh API key');
      }

      const newApiKey = apiKeyResponse.data.key;
      log(debug, 'API key refreshed successfully');

      // Update secure storage and SDK
      secureStorage.setItem(STORAGE_KEYS.API_KEY, newApiKey);
      sdk.setApiKey(newApiKey);

      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }, [sdk, fingerprintId, debug, handleError]);

  const handleApiError = useCallback(
    async (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Check if error is due to invalid API key
      if (
        errorMessage.includes('Invalid API key') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('API key expired')
      ) {
        log(debug, 'Invalid API key detected, attempting refresh');
        const refreshed = await refreshApiKey();
        if (refreshed) {
          return true; // Error handled
        }
      }

      // If not an API key error or refresh failed, handle normally
      handleError(err);
      return false;
    },
    [debug, refreshApiKey, handleError]
  );

  const trackVisit = useCallback(
    async (id: string) => {
      try {
        if (!id) return;
        log(debug, 'Tracking initial visit');
        await sdk.track('visit', {
          fingerprintId: id,
          url: window.location.href,
          title: document.title || window.location.pathname,
          metadata: {
            referrer: document.referrer || '',
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: getPlatformInfo(),
            hostname: window.location.hostname,
            path: window.location.pathname,
          },
        });
        log(debug, 'Visit tracked successfully');
      } catch (err) {
        const handled = await handleApiError(err);
        if (handled) {
          // Retry the operation with new API key
          await trackVisit(id);
        }
      }
    },
    [sdk, debug, handleApiError, getPlatformInfo]
  );

  const getBrowserFingerprint = useCallback(async () => {
    try {
      // Initialize an agent at application startup.
      const fpAgent = await fpjs.load();

      // Get the visitor identifier when you need it.
      const result = await fpAgent.get();

      // Use the visitor identifier as a stable identifier of the browser.
      return result.visitorId;
    } catch (err) {
      log(debug, 'Error getting browser fingerprint:', err);
      // Fallback to UUID if fingerprinting fails
      return crypto.randomUUID();
    }
  }, [debug]);

  const initializeFingerprint = useCallback(async () => {
    try {
      setIsLoading(true);
      log(debug, 'Initializing new fingerprint');

      // Get browser fingerprint
      const browserFingerprint = await getBrowserFingerprint();
      log(debug, 'Generated browser fingerprint:', browserFingerprint);

      // Step 1: Register fingerprint (public endpoint)
      const fingerprintResponse = await sdk.identify({
        fingerprint: browserFingerprint,
        metadata: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: getPlatformInfo(),
          url: window.location.href,
          referrer: document.referrer || '',
          timestamp: new Date().toISOString(),
        },
      });

      if (!fingerprintResponse.success || !fingerprintResponse.data) {
        throw new Error('Failed to register fingerprint');
      }

      const id = fingerprintResponse.data.id;
      log(debug, 'Fingerprint registered:', id);

      // Step 2: Register API key (public endpoint)
      const apiKeyResponse = await sdk.registerApiKey(id);
      if (!apiKeyResponse.success || !apiKeyResponse.data) {
        throw new Error('Failed to register API key');
      }

      const apiKey = apiKeyResponse.data.key;
      log(debug, 'API key registered successfully');

      // Step 3: Store credentials and update SDK
      secureStorage.setItem(STORAGE_KEYS.FINGERPRINT_ID, id);
      secureStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
      sdk.setApiKey(apiKey);

      // Step 4: Set state
      setFingerprintId(id);
      setFingerprint(fingerprintResponse.data);

      // Step 5: Track initial visit
      await trackVisit(id);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    sdk,
    debug,
    handleError,
    trackVisit,
    getPlatformInfo,
    getBrowserFingerprint,
  ]);

  // Initialization effect
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        log(debug, 'Starting initialization...');

        // Step 1: Load stored credentials from secure storage
        const storedFingerprintId = secureStorage.getItem(
          STORAGE_KEYS.FINGERPRINT_ID
        );
        const storedApiKey = secureStorage.getItem(STORAGE_KEYS.API_KEY);

        log(debug, 'Stored credentials found:', {
          hasFingerprintId: !!storedFingerprintId,
          hasApiKey: !!storedApiKey,
          fingerprintId: storedFingerprintId
            ? `${storedFingerprintId.substring(0, 5)}...`
            : null,
        });

        if (!storedFingerprintId || !storedApiKey) {
          log(debug, 'Missing stored credentials, creating new fingerprint');
          await initializeFingerprint();
          return;
        }

        // Step 2: Set API key first
        sdk.setApiKey(storedApiKey);
        log(debug, 'Set stored API key to SDK');

        // Step 3: Validate stored fingerprint
        log(debug, 'Validating stored fingerprint:', storedFingerprintId);

        try {
          const response = await sdk.getIdentity(storedFingerprintId);
          log(debug, 'Fingerprint validation response:', {
            success: response.success,
            hasData: !!response.data,
            fingerprintId: response.data?.id,
            matches: response.data?.id === storedFingerprintId,
          });

          if (!response.success || !response.data) {
            log(debug, 'Invalid fingerprint response, clearing storage');
            secureStorage.clear();
            await initializeFingerprint();
            return;
          }

          if (response.data.id !== storedFingerprintId) {
            log(debug, 'Fingerprint ID mismatch, clearing storage');
            secureStorage.clear();
            await initializeFingerprint();
            return;
          }

          if (isMounted) {
            log(
              debug,
              'Stored fingerprint is valid, using existing credentials'
            );
            setFingerprintId(storedFingerprintId);
            setFingerprint(response.data);
            await trackVisit(storedFingerprintId);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          log(debug, 'Error during fingerprint validation:', {
            message: errorMessage,
            error: err,
          });

          // Check if it's a server error response
          if (errorMessage === 'Not Found') {
            log(
              debug,
              'Server returned Not Found, clearing storage and reinitializing'
            );
            secureStorage.clear();
            await initializeFingerprint();
            return;
          }

          // Try to handle API key errors
          const handled = await handleApiError(err);
          if (!handled) {
            log(debug, 'Unhandled error, clearing storage');
            secureStorage.clear();
            await initializeFingerprint();
            return;
          }

          // If API key was refreshed, retry initialization
          if (handled && isMounted) {
            log(debug, 'API key refreshed, retrying initialization');
            await initialize();
          }
        }
      } catch (err) {
        log(debug, 'Error during initialization:', err);
        // Clear stored credentials on error
        secureStorage.clear();
        await initializeFingerprint();
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
          log(debug, 'Initialization complete');
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [sdk, debug, initializeFingerprint, trackVisit, handleApiError]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      log(debug, 'Connection status: Online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      log(debug, 'Connection status: Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [debug]);

  // Handle presence tracking
  useEffect(() => {
    if (!isInitialized || !fingerprintId) {
      log(debug, 'Not starting presence tracking - initialization incomplete');
      return;
    }

    const presenceInterval = sdk.getPresenceInterval();
    log(debug, `Starting presence tracking every ${presenceInterval}ms`);
    let isCancelled = false;

    const trackPresence = async () => {
      if (isCancelled) return;
      try {
        log(debug, 'Tracking presence');
        await sdk.track('presence', {
          fingerprintId,
          status: isOnline ? 'online' : 'offline',
          metadata: {
            url: window.location.href,
            path: window.location.pathname,
            title: document.title || window.location.pathname,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: getPlatformInfo(),
          },
        });
        log(debug, 'Presence tracked successfully');
      } catch (err) {
        const handled = await handleApiError(err);
        if (handled && !isCancelled) {
          // Retry the operation with new API key
          await trackPresence();
        }
      }
    };

    trackPresence();
    const presenceTimer = setInterval(trackPresence, presenceInterval);

    return () => {
      log(debug, 'Stopping presence tracking');
      isCancelled = true;
      clearInterval(presenceTimer);
    };
  }, [
    sdk,
    debug,
    fingerprintId,
    isOnline,
    handleApiError,
    isInitialized,
    getPlatformInfo,
  ]);

  // Set debug mode on storage
  useEffect(() => {
    secureStorage.setDebug(debug);
  }, [debug]);

  return (
    <ArgosContext.Provider
      value={{
        sdk,
        isOnline,
        fingerprintId,
        fingerprint,
        isLoading,
        error,
      }}
    >
      {children}
    </ArgosContext.Provider>
  );
}

// Core SDK hook
export const useArgosSDK = () => {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error('useArgosSDK must be used within an ArgosProvider');
  }
  return context.sdk;
};

// Fingerprint management hook
export const useFingerprint = () => {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error('useFingerprint must be used within an ArgosProvider');
  }

  return {
    fingerprintId: context.fingerprintId,
    fingerprint: context.fingerprint,
    isLoading: context.isLoading,
    error: context.error,
  };
};

// Online status hook
export const useOnlineStatus = () => {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error('useOnlineStatus must be used within an ArgosProvider');
  }
  return context.isOnline;
};
