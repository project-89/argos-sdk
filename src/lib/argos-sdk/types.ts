/**
 * Represents a user in the Argos system
 * @public
 */
export interface ArgosUser {
  /** Unique identifier for the user */
  id: string;
  /** Fingerprint identifier used for tracking */
  fingerprint: string;
  /** Additional metadata about the user */
  metadata?: Record<string, string | number | boolean>;
  /** User roles for permission management */
  roles?: string[];
  /** Custom tags for user categorization */
  tags?: Record<string, string | number | boolean>;
  /** When the user was first created */
  createdAt?: Date;
}

/**
 * Real-time presence data for a user
 * @public
 */
export interface PresenceData {
  /** User identifier (can be wallet address) */
  userId: string;
  /** Current presence status */
  status: 'online' | 'offline' | 'away';
  /** Last time the user was seen */
  lastSeen?: Date;
  /** Current page or location */
  currentPage?: string;
  /** Additional custom data */
  customData?: Record<string, string | number | boolean>;
}

/**
 * Configuration options for the Argos SDK
 * @public
 */
export interface ArgosConfig {
  /** API endpoint for the Argos service */
  baseUrl?: string;
  /**
   * Interval for sending heartbeat requests (in milliseconds)
   * @default 30000
   */
  heartbeatInterval?: number;
  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
  /**
   * Additional metadata to track with each request
   * Useful for tracking chain IDs, network versions, etc.
   */
  metadata?: Record<string, string | number | boolean>;
}

/**
 * User tags for analytics and categorization
 * @public
 */
export interface UserTags {
  /** User experience level */
  experience: number;
  /** Number of completed missions/tasks */
  missions_completed: number;
  /** First visit timestamp */
  first_visit: string;
  /** Additional custom tags */
  [key: string]: string | number | boolean;
}

/**
 * User role definition for permission management
 * @public
 */
export interface UserRole {
  /** Unique role identifier */
  id: string;
  /** Human-readable role name */
  name: string;
  /** Role level for hierarchical permissions */
  level: number;
  /** List of permissions granted to this role */
  permissions: string[];
}

/**
 * Configuration options for presence tracking
 * @public
 */
export interface PresenceTrackerConfig {
  /**
   * Interval for updating presence status (in milliseconds)
   * @default 30000
   */
  updateInterval?: number;
  /**
   * Automatically track page changes
   * @default true
   */
  autoTrackPages?: boolean;
}

/**
 * Event handler type for SDK events
 * @public
 */
export type EventHandler<T> = (data: T) => void | Promise<void>;

/**
 * Event types supported by the SDK
 * @public
 */
export interface EventMap {
  'presence:update': PresenceData;
  'user:update': ArgosUser;
  error: Error;
  'connection:change': { status: 'connected' | 'disconnected' };
}

export type EventType = keyof EventMap;
