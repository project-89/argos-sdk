import { useContext } from 'react';
import { ArgosContext } from '../context/ArgosContext';

/**
 * Hook to access online status
 * Must be used within an ArgosProvider
 */
export const useOnlineStatus = () => {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error('useOnlineStatus must be used within an ArgosProvider');
  }
  return context.isOnline;
};
