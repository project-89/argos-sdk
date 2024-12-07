/**
 * @packageDocumentation
 *
 * Argos SDK is a lightweight, privacy-first user tracking and fingerprinting toolkit
 * for modern web applications. It provides real-time presence tracking and user analytics
 * while maintaining user privacy.
 *
 * @example
 * ```typescript
 * import { ArgosTracker } from '@project89/argos-sdk';
 *
 * // Initialize the tracker
 * const tracker = await ArgosTracker.initialize('your-fingerprint-id', {
 *   baseUrl: 'your-api-endpoint',
 *   debug: true
 * });
 *
 * // Start tracking presence
 * await tracker.trackPresence('your-site-id');
 *
 * // Get user information
 * const user = await tracker.getUser();
 * ```
 */

export { ArgosTracker } from './ArgosTracker';
export { PresenceTracker } from './PresenceTracker';
export { EventEmitter } from './EventEmitter';
export { ArgosError } from './errors';
export { useArgosUser } from './hooks/useArgosUser';
export { useArgosPresence } from './hooks/useArgosPresence';
export * from './types';

// Export API classes
export { TagAPI } from './api/TagAPI';
export { APIKeyAPI } from './api/APIKeyAPI';
export { RealityStabilityAPI } from './api/RealityStabilityAPI';
export { DebugAPI } from './api/DebugAPI';

// Export types
export type { TagValue, TagRule, TagRules } from './api/TagAPI';
export type {
  RegisterApiKeyRequest,
  RegisterApiKeyResponse,
} from './api/APIKeyAPI';
export type { RealityStabilityResponse } from './api/RealityStabilityAPI';
export type { CleanupResult } from './api/DebugAPI';
export type { ApiResponse, ApiError } from './types/api';
