import type { ApiResponse, Fingerprint } from './api';

export interface SDKOptions {
  baseUrl: string;
  apiKey?: string;
  environment: any; // Will be either BrowserEnvironment or NodeEnvironment
  debug?: boolean;
}

export interface IdentifyOptions {
  fingerprint?: string;
  metadata?: Record<string, unknown>;
}

export interface SDKInterface {
  // Identity Management
  identify(options: IdentifyOptions): Promise<ApiResponse<Fingerprint>>;
  getIdentity(fingerprintId: string): Promise<ApiResponse<Fingerprint>>;
  updateFingerprint(
    fingerprintId: string,
    metadata: Record<string, unknown>
  ): Promise<ApiResponse<Fingerprint>>;

  // API Key Management
  setApiKey(apiKey: string): void;
  getApiKey(): string | undefined;

  // Environment Information
  getPlatformInfo(): Promise<Record<string, unknown>>;
}
