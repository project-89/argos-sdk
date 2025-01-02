// Import polyfills first
import './polyfills';

// Core SDK
export { ArgosClientSDK } from './sdk/ArgosClientSDK';
export type { ClientSDKConfig } from './sdk/ArgosClientSDK';

// Types
export * from './types/request';
export { clientFetch } from './http/fetch';

// Note: React components should be imported from '@project89/argos-sdk/client/react'
// to ensure they are only used in client components
