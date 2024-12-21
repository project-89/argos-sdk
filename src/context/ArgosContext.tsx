import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { ArgosSDK } from '../ArgosSDK';
import { FingerprintData } from '../types/api';
import { log } from '../utils/logger';

const STORAGE_KEYS = {
  FINGERPRINT_ID: 'argos_fingerprint_id',
} as const;

interface ArgosContextType {
  sdk: ArgosSDK;
  isOnline: boolean;
  fingerprintId: string | null;
  fingerprint: FingerprintData | null;
  isLoading: boolean;
  error: Error | null;
}

interface ArgosProviderProps {
  children: React.ReactNode;
  config: {
    baseUrl: string;
    debug?: boolean;
  };
  debug?: boolean;
  onError?: (error: Error) => void;
}

const ArgosContext = createContext<ArgosContextType | null>(null);

export function ArgosProvider({
  config,
  children,
  onError,
  debug = false,
}: ArgosProviderProps) {
  const [sdk] = useState(() => new ArgosSDK({ ...config, debug }));
  const [isOnline, setIsOnline] = useState(sdk.isOnline());
  const [fingerprintId, setFingerprintId] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const presenceIntervalDuration = 30000; // 30 seconds

  const handleError = useCallback(
    (err: unknown) => {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      onError?.(errorObj);
      log(debug, 'Error:', errorObj);
    },
    [onError, debug]
  );

  const trackVisit = useCallback(
    async (id: string) => {
      try {
        if (!id) return;
        log(debug, 'Tracking initial visit');
        await sdk.track('visit', {
          fingerprintId: id,
          url: window.location.href || '',
          referrer: document.referrer || '',
          timestamp: Date.now(),
          title: document.title || window.location.pathname || '',
          path: window.location.pathname || '',
          hostname: window.location.hostname || '',
          metadata: {
            userAgent: navigator.userAgent || '',
            language: navigator.language || '',
            platform: navigator.platform || '',
          },
        });
        log(debug, 'Visit tracked successfully');
      } catch (err) {
        handleError(err);
      }
    },
    [sdk, debug, handleError]
  );

  const initializeFingerprint = useCallback(async () => {
    try {
      setIsLoading(true);
      const visitorId = crypto.randomUUID();
      log(debug, 'Initializing fingerprint with visitor ID:', visitorId);

      const response = await sdk.identify({
        fingerprint: visitorId,
        metadata: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          url: window.location.href,
          referrer: document.referrer || '',
          timestamp: Date.now(),
        },
      });

      if (response.success && response.data) {
        log(debug, 'Fingerprint registered successfully:', response.data);
        const id = response.data.id;
        setFingerprintId(id);
        setFingerprint(response.data);
        localStorage.setItem(STORAGE_KEYS.FINGERPRINT_ID, id);
        await trackVisit(id);
      } else {
        throw new Error('Failed to register fingerprint');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [sdk, debug, handleError, trackVisit]);

  // Initialization effect
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const storedFingerprintId = localStorage.getItem(
          STORAGE_KEYS.FINGERPRINT_ID
        );

        if (storedFingerprintId) {
          log(debug, 'Found stored fingerprint ID:', storedFingerprintId);
          setFingerprintId(storedFingerprintId);

          // First validate the fingerprint
          const identityResponse = await sdk.getIdentity(storedFingerprintId);
          if (identityResponse.success) {
            log(
              debug,
              'Retrieved stored fingerprint data:',
              identityResponse.data
            );
            if (isMounted) {
              setFingerprint(identityResponse.data);
              await trackVisit(storedFingerprintId);
            }
          } else {
            log(
              debug,
              'Stored fingerprint not found or invalid, creating new one'
            );
            await initializeFingerprint();
          }
        } else {
          log(debug, 'No stored fingerprint found, creating new one');
          await initializeFingerprint();
        }
      } catch (err) {
        log(debug, 'Error during initialization:', err);
        await initializeFingerprint();
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [sdk, debug, initializeFingerprint, trackVisit]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle presence tracking after full initialization
  useEffect(() => {
    if (!isInitialized || !fingerprintId) {
      log(debug, 'Not starting presence tracking - initialization incomplete');
      return;
    }

    log(debug, 'Starting presence tracking every 30 seconds');
    let isCancelled = false;

    const trackPresence = async () => {
      if (isCancelled) return;
      try {
        log(debug, 'Tracking presence');
        await sdk.track('presence', {
          fingerprintId,
          status: isOnline ? 'online' : 'offline',
          timestamp: Date.now(),
          metadata: {
            url: window.location.href,
            path: window.location.pathname,
            title: document.title || window.location.pathname,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
          },
        });
        log(debug, 'Presence tracked successfully');
      } catch (err) {
        handleError(err);
      }
    };

    trackPresence();
    const presenceInterval = setInterval(
      trackPresence,
      presenceIntervalDuration
    );

    return () => {
      log(debug, 'Stopping presence tracking');
      isCancelled = true;
      clearInterval(presenceInterval);
    };
  }, [sdk, debug, fingerprintId, isOnline, handleError, isInitialized]);

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

export const useArgosSDK = () => {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error('useArgosSDK must be used within an ArgosProvider');
  }
  return context;
};

export const useArgosPresence = () => {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error('useArgosPresence must be used within an ArgosProvider');
  }
  return {
    isOnline: context.isOnline,
    fingerprintId: context.fingerprintId,
    fingerprint: context.fingerprint,
    isLoading: context.isLoading,
    error: context.error,
  };
};
