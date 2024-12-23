import { useContext } from 'react';
import { ArgosContext } from '../context/ArgosContext';

/**
 * Hook to access fingerprint data and state
 * Must be used within an ArgosProvider
 */
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
