import { useContext } from 'react';
import { ArgosContext } from '../context/ArgosContext';
import type { ArgosClientSDK } from '../../sdk/ArgosClientSDK';

/**
 * Hook to access the ArgosSDK instance
 * Must be used within an ArgosProvider
 */
export const useArgosSDK = (): ArgosClientSDK => {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error('useArgosSDK must be used within an ArgosProvider');
  }
  return context.sdk;
};
