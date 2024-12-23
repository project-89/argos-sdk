import { useContext } from 'react';
import { ArgosContext } from '../context/ArgosContext';

/**
 * Hook to access the ArgosSDK instance
 * Must be used within an ArgosProvider
 */
export const useArgosSDK = () => {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error('useArgosSDK must be used within an ArgosProvider');
  }
  return context.sdk;
};
