export interface Fingerprint {
  id: string;
  fingerprint: string;
  roles: string[];
  createdAt: string;
  metadata: Record<string, any>;
  tags: Record<string, any>;
}

export interface FingerprintRegistrationData {
  fingerprint: string;
  metadata?: Record<string, any>;
}
