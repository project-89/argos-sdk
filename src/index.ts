// Core SDK exports
export type { SDKInterface, SDKOptions } from './shared/interfaces/sdk';
export { ArgosServerSDK } from './server/sdk/ArgosServerSDK';
export { ArgosClientSDK } from './client/sdk/ArgosClientSDK';
export { RuntimeEnvironment } from './shared/interfaces/environment';

// Type exports
export type {
  EnvironmentInterface,
  StorageInterface,
} from './shared/interfaces/environment';
export type { ServerSDKConfig } from './server/sdk/ArgosServerSDK';

// React-specific exports (browser only)
export { ArgosProvider } from './client/react/context/ArgosContext';
export { useArgosSDK } from './client/react/hooks/useArgosSDK';
export { useFingerprint } from './client/react/hooks/useFingerprint';
export { useOnlineStatus } from './client/react/hooks/useOnlineStatus';
export { useMetadata } from './client/react/hooks/useMetadata';
export { useImpressions } from './client/react/hooks/useImpressions';

// Storage implementations
export { CookieStorage } from './client/storage/CookieStorage';
export { SecureStorage } from './server/storage/SecureStorage';

// Environment implementations
export { BrowserEnvironment } from './client/environment/BrowserEnvironment';
export { NodeEnvironment } from './server/environment/NodeEnvironment';

// React Components
export {
  ArgosTracker,
  withImpressionTracking,
} from './client/react/components';
export type {
  ArgosTrackerProps,
  WithImpressionTrackingProps,
} from './client/react/components';
