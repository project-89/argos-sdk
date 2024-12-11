import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { ArgosSDK, ArgosSDKConfig } from '../ArgosSDK';

interface ArgosContextType {
  sdk: ArgosSDK;
  isOnline: boolean;
}

interface ArgosProviderProps {
  config: ArgosSDKConfig;
  children: ReactNode;
}

export const ArgosContext = createContext<ArgosContextType | undefined>(
  undefined
);

export function ArgosProvider({ config, children }: ArgosProviderProps) {
  const [sdk] = useState(() => new ArgosSDK(config));
  const [isOnline, setIsOnline] = useState(sdk.isOnline());
  const [fingerprintId, setFingerprintId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize fingerprinting
    const userAgent =
      typeof navigator !== 'undefined' ? navigator.userAgent : '';
    sdk
      .identify({
        userAgent,
        ip: '', // Will be set by server
        metadata: {
          language: typeof navigator !== 'undefined' ? navigator.language : '',
          platform: typeof navigator !== 'undefined' ? navigator.platform : '',
        },
      })
      .then((response) => {
        if (response.success && response.data) {
          setFingerprintId(response.data.id);
          // Start tracking visit
          return sdk.track('visit', {
            fingerprintId: response.data.id,
            url: typeof window !== 'undefined' ? window.location.href : '',
            timestamp: new Date().toISOString(),
          });
        }
      })
      .catch(console.error);

    // Start presence tracking
    const interval = setInterval(() => {
      if (fingerprintId) {
        sdk
          .track('presence', {
            fingerprintId,
            currentPage:
              typeof window !== 'undefined' ? window.location.pathname : '',
            timestamp: new Date().toISOString(),
          })
          .catch(console.error);
      }
    }, 30000);

    // Handle online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [sdk, fingerprintId]);

  const value = {
    sdk,
    isOnline,
  };

  return (
    <ArgosContext.Provider value={value}>{children}</ArgosContext.Provider>
  );
}

export function useArgosSDK() {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error('useArgosSDK must be used within an ArgosProvider');
  }
  return context.sdk;
}

export function useArgosPresence() {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error('useArgosPresence must be used within an ArgosProvider');
  }
  return {
    isOnline: context.isOnline,
  };
}
