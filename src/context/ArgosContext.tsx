import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { ArgosSDK, ArgosSDKConfig } from '../ArgosSDK';
import { Fingerprint } from '../types/api';
import { log } from '../utils/logger';
import * as fpjs from '@fingerprintjs/fingerprintjs';

const STORAGE_KEYS = {
  FINGERPRINT_ID: 'argos_fingerprint_id',
  API_KEY: 'argos_api_key',
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
        handleError(err);
      }
    },
    [sdk, debug, handleError, getPlatformInfo]
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
      localStorage.setItem(STORAGE_KEYS.FINGERPRINT_ID, id);
      localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
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

        // Step 1: Load stored credentials
        const storedFingerprintId = localStorage.getItem(
          STORAGE_KEYS.FINGERPRINT_ID
        );
        const storedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);

        log(debug, 'Stored credentials:', {
          storedFingerprintId,
          storedApiKey: storedApiKey ? '[REDACTED]' : null,
        });

        if (!storedFingerprintId || !storedApiKey) {
          log(debug, 'No stored credentials, creating new fingerprint');
          await initializeFingerprint();
          return;
        }

        // Step 2: Set API key first
        sdk.setApiKey(storedApiKey);
        log(debug, 'Loaded stored API key');

        // Step 3: Validate stored fingerprint
        log(debug, 'Validating stored fingerprint:', storedFingerprintId);

        try {
          const response = await sdk.getIdentity(storedFingerprintId);
          log(debug, 'Fingerprint validation response:', response);

          if (response.success && response.data && isMounted) {
            log(debug, 'Stored fingerprint valid');
            setFingerprintId(storedFingerprintId);
            setFingerprint(response.data);
            await trackVisit(storedFingerprintId);
          } else {
            log(debug, 'Stored fingerprint invalid, creating new one');
            await initializeFingerprint();
          }
        } catch (err) {
          log(debug, 'Error validating fingerprint:', err);
          throw err;
        }
      } catch (err) {
        log(debug, 'Error during initialization:', err);
        // Clear stored credentials on error
        localStorage.removeItem(STORAGE_KEYS.FINGERPRINT_ID);
        localStorage.removeItem(STORAGE_KEYS.API_KEY);
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
  }, [sdk, debug, initializeFingerprint, trackVisit]);

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
        handleError(err);
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
    handleError,
    isInitialized,
    getPlatformInfo,
  ]);

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
