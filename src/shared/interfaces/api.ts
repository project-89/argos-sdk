declare global {
  interface Navigator {
    userAgentData?: {
      platform: string;
      brands: Array<{ brand: string; version: string }>;
      mobile: boolean;
    };
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  requestId?: string;
  timestamp?: number;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  retryAfter?: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface IpMetadata {
  ipFrequency: Record<string, number>;
  lastSeenAt: Record<string, FirestoreTimestamp>;
  primaryIp: string;
  suspiciousIps: string[];
}

export interface Fingerprint {
  id: string;
  fingerprint: string;
  roles: string[];
  createdAt: FirestoreTimestamp;
  metadata: Record<string, any>;
  ipAddresses: string[];
  ipMetadata: IpMetadata;
  tags: string[];
}

export interface VisitData {
  id: string;
  fingerprintId: string;
  url: string;
  title: string;
  timestamp: string;
  site: {
    domain: string;
    visitCount: number;
  };
}

export interface PresenceData {
  success: boolean;
  timestamp: string;
}

export interface APIKeyData {
  key: string;
  fingerprintId: string;
  expiresAt: string;
}

export interface PriceData {
  prices: {
    [tokenId: string]: {
      price: number;
      timestamp: string;
      change24h?: number;
    };
  };
}

export interface PriceHistoryData {
  history: Array<{
    price: number;
    timestamp: string;
  }>;
}

export interface RoleData {
  roles: string[];
}

export interface TagData {
  tags: string[];
  metadata?: Record<string, any>;
}

export interface SystemHealthData {
  status: 'ok' | 'error';
  version: string;
  timestamp: string;
}

// Request Types
export interface CreateFingerprintRequest {
  fingerprint: string;
  metadata?: Record<string, any>;
}

export interface CreateVisitRequest {
  fingerprintId: string;
  url: string;
  title?: string;
  type?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePresenceRequest {
  fingerprintId: string;
  status: 'online' | 'offline';
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface CreateAPIKeyRequest {
  name: string;
  expiresAt?: string;
}

export interface UpdateAPIKeyRequest {
  name?: string;
  expiresAt?: string;
}

export interface RevokeAPIKeyRequest {
  key: string;
}

export interface ValidateAPIKeyRequest {
  key: string;
}

export interface ValidateAPIKeyResponse {
  valid: boolean;
  fingerprintId?: string;
}

export interface GetVisitHistoryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetPriceHistoryOptions {
  interval?: '1h' | '24h' | '7d' | '30d';
  limit?: number;
}

export interface GetCurrentPricesOptions {
  tokens?: string[];
}

export interface DebugData {
  timestamp: string;
  environment: string;
  version: string;
  config: Record<string, any>;
  metrics: Record<string, any>;
}

export interface RealityStabilityData {
  stability: number;
  timestamp: string;
  factors: Record<string, number>;
  trend: 'stable' | 'increasing' | 'decreasing';
}

export interface ImpressionData {
  id: string;
  fingerprintId: string;
  type: string;
  data: Record<string, any>;
  createdAt: string;
  source?: string;
  sessionId?: string;
}

export interface CreateImpressionRequest {
  fingerprintId: string;
  type: string;
  data: Record<string, any>;
  source?: string;
  sessionId?: string;
}

export interface GetImpressionsOptions {
  type?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
  sessionId?: string;
}

export interface DeleteImpressionsResponse {
  deletedCount: number;
}

export interface UpdateTagsRequest {
  tags: string[];
  metadata?: Record<string, any>;
}
