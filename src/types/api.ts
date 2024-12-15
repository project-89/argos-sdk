export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface FingerprintData {
  id: string;
  fingerprint: string;
  metadata?: Record<string, any>;
  roles?: string[];
  tags?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface VisitData {
  id: string;
  fingerprintId: string;
  url: string;
  title?: string;
  referrer?: string;
  timestamp: number;
}

export interface PresenceData {
  fingerprintId: string;
  status: "online" | "offline";
  lastUpdated: number;
  metadata?: Record<string, any>;
}

export interface APIKeyData {
  id: string;
  key: string;
  name: string;
  fingerprintId: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface PriceData {
  usd: number;
  usd_24h_change: number;
}

export interface StabilityData {
  index: number;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface RealityStabilityData {
  index: number;
  timestamp: number;
  metadata: Record<string, any>;
  factors?: {
    priceStability?: number;
    networkActivity?: number;
    socialSentiment?: number;
  };
}

export interface RoleData {
  fingerprintId: string;
  roles: string[];
  timestamp: string;
}

export interface TagData {
  fingerprintId: string;
  tags: Record<string, number>;
}

export interface DebugData {
  message: string;
  timestamp: number;
  data?: Record<string, any>;
}

// Request Types
export interface CreateFingerprintRequest {
  fingerprint: string;
  metadata?: Record<string, any>;
}

export interface UpdateFingerprintRequest {
  metadata?: Record<string, any>;
  tags?: Record<string, number>;
}

export interface CreateVisitRequest {
  fingerprintId: string;
  url: string;
  title?: string;
  referrer?: string;
  timestamp?: number;
}

export interface UpdatePresenceRequest {
  fingerprintId: string;
  status: "online" | "offline";
  metadata?: Record<string, any>;
}

export interface CreateAPIKeyRequest {
  name: string;
  fingerprintId: string;
  metadata?: Record<string, any>;
}

export interface UpdateAPIKeyRequest {
  name?: string;
  metadata?: Record<string, any>;
  enabled?: boolean;
}
