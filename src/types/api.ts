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

export interface FingerprintData {
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

// Request Types
export interface CreateFingerprintRequest {
  fingerprint: string;
  metadata?: Record<string, any>;
}

export interface UpdateFingerprintRequest {
  metadata?: Record<string, any>;
}

export interface CreateVisitRequest {
  fingerprintId: string;
  url: string;
  title?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePresenceRequest {
  fingerprintId: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
}

export interface ValidateAPIKeyRequest {
  key: string;
}

export interface ValidateAPIKeyResponse {
  valid: boolean;
  fingerprintId?: string;
}

export interface DebugData {
  message: string;
  timestamp: number;
  data: Record<string, any>;
}
