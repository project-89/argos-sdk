export { ArgosSDK } from './ArgosSDK';
export type { ArgosSDKConfig } from './ArgosSDK';
export { ArgosProvider } from './context/ArgosContext';
export { useArgosSDK } from './hooks/useArgosSDK';
export { useFingerprint } from './hooks/useFingerprint';
export { useOnlineStatus } from './hooks/useOnlineStatus';
export { useMetadata } from './hooks/useMetadata';
export { useImpressions } from './hooks/useImpressions';

export type {
  ApiResponse,
  ApiError,
  ApiSuccess,
  Fingerprint,
  VisitData,
  PresenceData,
  APIKeyData,
  PriceData,
  PriceHistoryData,
  RoleData,
  TagData,
  SystemHealthData,
  DebugData,
  RealityStabilityData,
  ImpressionData,
} from './types/api';

export const apiConfig = {
  baseUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:5001'
      : 'https://argos.project89.org',
  debug: process.env.NODE_ENV === 'development',
};
