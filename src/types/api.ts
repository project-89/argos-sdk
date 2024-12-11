export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status?: number;
}

export type UserRole = 'user' | 'premium' | 'vip' | 'admin';

export interface UserTags {
  experience: number;
  missions_completed: number;
  first_visit: string;
}

export interface ArgosUser {
  id: string;
  fingerprintId: string;
  roles: UserRole[];
  tags: UserTags;
  createdAt: string;
  updatedAt: string;
}

export interface FingerprintData {
  id: string;
  userAgent: string;
  ip: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TagData {
  fingerprintId: string;
  tags: string[];
  timestamp: string;
}

export interface RoleData {
  fingerprintId: string;
  roles: string[];
  timestamp: string;
}

export interface VisitData {
  id: string;
  fingerprintId: string;
  url: string;
  referrer?: string;
  timestamp: string;
}

export interface VisitStatsData {
  total: number;
  unique: number;
  byDate: Record<string, number>;
}

export interface RealityStabilityData {
  stabilityIndex: number;
  currentPrice: number;
  priceChange: number;
  timestamp: string;
}

export interface DebugData {
  message: string;
  timestamp: string;
  level: string;
  metadata?: Record<string, any>;
}

export interface APIKeyData {
  id: string;
  name: string;
  key: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceData {
  id: string;
  amount: number;
  currency: string;
  timestamp: string;
}
