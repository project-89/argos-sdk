'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { ArgosClientSDK } from '../../sdk/ArgosClientSDK';
import type { ClientSDKConfig } from '../../sdk/ArgosClientSDK';
import { Fingerprint, ApiResponse } from '../../../shared/interfaces/api';
import { log } from '../../../shared/utils/logger';

export interface ArgosContextType {
  sdk: ArgosClientSDK | null;
  isOnline: boolean;
  fingerprintId: string | null;
  fingerprint: Fingerprint | null;
  isLoading: boolean;
  error: Error | null;
}

export interface ArgosProviderProps {
  children: React.ReactNode;
  config: ClientSDKConfig;
  onError?: (error: Error) => void;
  debug?: boolean;
}

export const ArgosContext = createContext<ArgosContextType | null>(null);

export function ArgosProvider({
  config,
  children,
  onError,
  debug = false,
}: ArgosProviderProps): JSX.Element {
  const [sdk, setSdk] = useState<ArgosClientSDK | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [fingerprintId, setFingerprintId] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<Fingerprint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const getPlatformInfo = useCallback(async () => {
    if (!sdk) throw new Error('SDK not initialized');
    if (!('environment' in sdk)) throw new Error('Environment not initialized');
    const environment = sdk['environment'];
    if (!environment) throw new Error('Environment not available');
    return environment.getPlatformInfo();
  }, [sdk]);

  const getBrowserFingerprint = useCallback(async () => {
    if (!sdk) throw new Error('SDK not initialized');
    if (!('environment' in sdk)) throw new Error('Environment not initialized');
    const environment = sdk['environment'];
    if (!environment) throw new Error('Environment not available');
    return environment.getFingerprint();
  }, [sdk]);

  const refreshApiKey = useCallback(async () => {
    if (!sdk) throw new Error('SDK not initialized');
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

      if (
        errorMessage.includes('Invalid API key') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('API key expired')
      ) {
        log(debug, 'Invalid API key detected, attempting refresh');
        const refreshed = await refreshApiKey();
        if (refreshed) {
          return true;
        }
      }

      handleError(err);
      return false;
    },
    [debug, refreshApiKey, handleError]
  );

  const trackVisit = useCallback(
    async (id: string) => {
      if (!sdk || !id) return;
      try {
        log(debug, 'Tracking initial visit');
        const platformInfo = await getPlatformInfo();
        await sdk.track('visit', {
          fingerprintId: id,
          metadata: {
            ...platformInfo,
          },
        });
        log(debug, 'Visit tracked successfully');
      } catch (err) {
        const handled = await handleApiError(err);
        if (handled) {
          await trackVisit(id);
        }
      }
    },
    [sdk, debug, handleApiError, getPlatformInfo]
  );

  useEffect(() => {
    let isMounted = true;

    const initSDK = async () => {
      try {
        const sdkInstance = new ArgosClientSDK({ ...config, debug });
        if (isMounted) {
          setSdk(sdkInstance);
          setIsLoading(true);
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        if (isMounted) {
          setError(errorObj);
          onError?.(errorObj);
        }
      }
    };

    initSDK();

    return () => {
      isMounted = false;
    };
  }, [config, debug, onError]);

  useEffect(() => {
    if (!sdk) return;

    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [sdk]);

  const initializeFingerprint = useCallback(async () => {
    if (!sdk) {
      log(debug, 'SDK not initialized');
      return;
    }

    try {
      setIsLoading(true);
      log(debug, 'Initializing new fingerprint');

      const fingerprint = await getBrowserFingerprint();
      log(debug, 'Generated fingerprint:', fingerprint);

      const platformInfo = await getPlatformInfo();

      const fingerprintResponse = await sdk.identify({
        fingerprint,
        metadata: {
          ...platformInfo,
          timestamp: new Date().toISOString(),
        },
      });

      if (!fingerprintResponse.success || !fingerprintResponse.data) {
        throw new Error('Failed to register fingerprint');
      }

      const id = fingerprintResponse.data.id;
      log(debug, 'Fingerprint registered:', id);

      const apiKeyResponse = await sdk.registerApiKey(id);
      if (!apiKeyResponse.success || !apiKeyResponse.data) {
        throw new Error('Failed to register API key');
      }

      const apiKey = apiKeyResponse.data.key;
      log(debug, 'API key registered successfully');

      sdk.setApiKey(apiKey);

      setFingerprintId(id);
      setFingerprint(fingerprintResponse.data);

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

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!sdk) {
        log(debug, 'SDK not initialized');
        return;
      }

      try {
        log(debug, 'Starting initialization...');

        const storedFingerprintId = await sdk.getIdentity(fingerprintId || '');

        log(debug, 'Stored fingerprint found:', {
          hasFingerprintId: !!storedFingerprintId?.data,
          fingerprintId: storedFingerprintId?.data?.id
            ? `${storedFingerprintId.data.id.substring(0, 5)}...`
            : null,
        });

        if (!storedFingerprintId?.data) {
          log(debug, 'Missing stored fingerprint, creating new one');
          await initializeFingerprint();
          return;
        }

        log(
          debug,
          'Validating stored fingerprint:',
          storedFingerprintId.data.id
        );

        try {
          const response = await sdk.getIdentity(storedFingerprintId.data.id);
          log(debug, 'Fingerprint validation response:', {
            success: response.success,
            hasData: !!response.data,
            fingerprintId: response.data?.id,
            matches: response.data?.id === storedFingerprintId.data.id,
          });

          if (!response.success || !response.data) {
            log(debug, 'Invalid fingerprint response, reinitializing');
            await initializeFingerprint();
            return;
          }

          if (response.data.id !== storedFingerprintId.data.id) {
            log(debug, 'Fingerprint ID mismatch, reinitializing');
            await initializeFingerprint();
            return;
          }

          if (isMounted) {
            log(
              debug,
              'Stored fingerprint is valid, using existing credentials'
            );
            setFingerprintId(storedFingerprintId.data.id);
            setFingerprint(response.data);
            await trackVisit(storedFingerprintId.data.id);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          log(debug, 'Error during fingerprint validation:', {
            message: errorMessage,
            error: err,
          });

          if (errorMessage === 'Not Found') {
            log(debug, 'Server returned Not Found, reinitializing');
            await initializeFingerprint();
            return;
          }

          const handled = await handleApiError(err);
          if (!handled) {
            log(debug, 'Unhandled error, reinitializing');
            await initializeFingerprint();
            return;
          }

          if (handled && isMounted) {
            log(debug, 'API key refreshed, retrying initialization');
            await initialize();
          }
        }
      } catch (err) {
        log(debug, 'Error during initialization:', err);
        await initializeFingerprint();
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
          log(debug, 'Initialization complete');
        }
      }
    };

    if (sdk) {
      initialize();
    }

    return () => {
      isMounted = false;
    };
  }, [
    sdk,
    debug,
    initializeFingerprint,
    trackVisit,
    handleApiError,
    fingerprintId,
  ]);

  useEffect(() => {
    if (!isInitialized || !fingerprintId || !sdk) {
      log(debug, 'Not starting presence tracking - initialization incomplete');
      return;
    }

    const presenceInterval = sdk.getPresenceInterval();
    log(debug, `Starting presence tracking every ${presenceInterval}ms`);
    let isCancelled = false;

    const trackPresence = async () => {
      if (isCancelled || !sdk) return;
      try {
        log(debug, 'Tracking presence');
        const platformInfo = await getPlatformInfo();
        await sdk.track('presence', {
          fingerprintId,
          status: isOnline ? 'online' : 'offline',
          metadata: {
            ...platformInfo,
          },
        });
        log(debug, 'Presence tracked successfully');
      } catch (err) {
        const handled = await handleApiError(err);
        if (handled && !isCancelled) {
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

  if (!sdk) {
    return <>{children}</>;
  }

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
