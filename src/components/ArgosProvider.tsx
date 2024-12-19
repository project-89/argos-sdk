import React, { createContext, useContext, useEffect, useState } from 'react';
import { ArgosTracker } from '../ArgosTracker';
import type { BaseAPIConfig } from '../api/BaseAPI';

interface ArgosContextType {
  sdk: ArgosTracker | null;
  isInitialized: boolean;
  error: Error | null;
}

interface ArgosProviderProps {
  config: BaseAPIConfig;
  children: React.ReactNode;
}

const ArgosContext = createContext<ArgosContextType>({
  sdk: null,
  isInitialized: false,
  error: null,
});

export const useArgosSDK = () => {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error('useArgosSDK must be used within an ArgosProvider');
  }
  return context;
};

export const ArgosProvider: React.FC<ArgosProviderProps> = ({
  config,
  children,
}) => {
  const [sdk, setSdk] = useState<ArgosTracker | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const instance = new ArgosTracker(config);
      setSdk(instance);
      setIsInitialized(true);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to initialize ArgosSDK')
      );
    }
  }, [config]);

  return (
    <ArgosContext.Provider value={{ sdk, isInitialized, error }}>
      {children}
    </ArgosContext.Provider>
  );
};
