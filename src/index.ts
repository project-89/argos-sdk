export { ArgosSDK } from './ArgosSDK';
export type { ArgosSDKConfig } from './ArgosSDK';
export type * from './types/api';
export { ArgosProvider } from './context/ArgosContext';
export { useArgosSDK } from './hooks/useArgosSDK';
export { useFingerprint } from './hooks/useFingerprint';
export { useOnlineStatus } from './hooks/useOnlineStatus';
export { useMetadata } from './hooks/useMetadata';

export const apiConfig = {
  baseUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:5001'
      : 'https://argos.project89.org',
  debug: process.env.NODE_ENV === 'development',
};
