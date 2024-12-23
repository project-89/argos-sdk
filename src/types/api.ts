declare global {
  interface Navigator {
    userAgentData?: {
      platform: string;
      brands: Array<{ brand: string; version: string }>;
      mobile: boolean;
    };
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

export interface Fingerprint {
  id: string;
  fingerprint: string;
  roles: string[];
  createdAt: string;
  metadata: Record<string, any>;
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
