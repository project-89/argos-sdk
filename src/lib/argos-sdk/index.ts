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
export { useArgosPresence } from './hooks/useArgosPresence';
export type {
  ArgosConfig,
  ArgosUser,
  PresenceData,
  UserTags,
  UserRole,
  PresenceTrackerConfig,
  EventHandler,
  EventMap,
  EventType,
} from './types';
export { ArgosError } from './errors';
