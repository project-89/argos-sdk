export interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface EnvironmentInterface {
  getFingerprint(): Promise<string>;
  getPlatformInfo(): string;
  isOnline(): boolean;
  getLanguage(): string;
  getUserAgent(): string;
  getUrl(): string | null;
  getReferrer(): string | null;

  // Add environment-specific fetch behavior
  createHeaders(headers: Record<string, string>): any;
  handleResponse(response: any): Promise<any>;
}

export interface RuntimeConfig {
  storage?: StorageInterface;
  environment?: EnvironmentInterface;
  debug?: boolean;
}

export enum RuntimeEnvironment {
  Browser = 'browser',
  Server = 'server',
  Unknown = 'unknown',
}

export function detectEnvironment(): RuntimeEnvironment {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return RuntimeEnvironment.Browser;
  }

  if (typeof process !== 'undefined' && process.versions?.node) {
    return RuntimeEnvironment.Server;
  }

  return RuntimeEnvironment.Unknown;
}
