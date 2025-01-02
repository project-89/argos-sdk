import { useContext } from 'react';
import { ArgosContext } from '../context/ArgosContext';
import type { ArgosClientSDK } from '../../sdk/ArgosClientSDK';

/**
 * Hook to access the ArgosSDK instance
 * Must be used within an ArgosProvider
 * @throws {Error} If used outside of ArgosProvider or if SDK is not initialized
 */
export const useArgosSDK = (): ArgosClientSDK => {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error('useArgosSDK must be used within an ArgosProvider');
  }
  if (!context.sdk) {
    throw new Error('ArgosSDK is not initialized yet');
  }
  return context.sdk;
};
