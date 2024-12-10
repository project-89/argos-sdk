import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { ArgosSDK } from '../ArgosSDK';
import { PresenceData } from '../PresenceTracker';

interface ArgosContextType {
  sdk: ArgosSDK;
  presence: PresenceData | null;
  isOnline: boolean;
}

interface ArgosProviderProps {
  sdk: ArgosSDK;
  children: ReactNode;
}

const ArgosContext = createContext<ArgosContextType | undefined>(undefined);

export function ArgosProvider({ sdk, children }: ArgosProviderProps) {
  const [presence, setPresence] = React.useState<PresenceData | null>(null);

  useEffect(() => {
    // Start presence tracking
    const tracker = sdk.presence;

    function handlePresence(data: PresenceData) {
      setPresence(data);
    }

    function handleError(error: Error) {
      console.error('Presence tracking error:', error);
    }

    tracker.on('presence', handlePresence);
    tracker.on('error', handleError);
    tracker.start();

    // Start fingerprint tracking
    const userAgent =
      typeof navigator !== 'undefined' ? navigator.userAgent : '';
    sdk.fingerprint
      .createFingerprint({
        userAgent,
        ip: '', // Will be set by server
        metadata: {
          language: typeof navigator !== 'undefined' ? navigator.language : '',
          platform: typeof navigator !== 'undefined' ? navigator.platform : '',
        },
      })
      .catch(console.error);

    return () => {
      tracker.stop();
      tracker.off('presence', handlePresence);
      tracker.off('error', handleError);
    };
  }, [sdk]);

  const value = {
    sdk,
    presence,
    isOnline: sdk.isOnline(),
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
    presence: context.presence,
    isOnline: context.isOnline,
  };
}
