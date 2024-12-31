// Client SDK
export { ArgosClientSDK } from './sdk/ArgosClientSDK';

// React Components
export {
  ArgosTracker,
  useTrackImpression,
} from './react/components/ArgosTracker';
export { withImpressionTracking } from './react/components/withImpressionTracking';

// React Hooks
export {
  useArgosSDK,
  useFingerprint,
  useImpressions,
  useMetadata,
  useOnlineStatus,
} from './react/hooks';

// React Context
export { ArgosContext } from './react/context/ArgosContext';

// Types
export type { ClientSDKConfig, TrackOptions } from './sdk/ArgosClientSDK';
export type { ArgosTrackerProps } from './react/components/ArgosTracker';

// Re-export shared types that are needed for client
export type {
  ApiResponse,
  ImpressionData,
  Fingerprint,
  CreateImpressionRequest,
  GetImpressionsOptions,
} from '../shared/interfaces/api';
