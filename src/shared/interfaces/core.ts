export interface SDKConfig {
  baseUrl: string;
  debug?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RequestOptions {
  method: string;
  body?: string;
  headers?: Record<string, string>;
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
