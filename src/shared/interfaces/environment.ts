export enum RuntimeEnvironment {
  Browser = 'browser',
  Node = 'node',
  Test = 'test',
}

export interface StorageInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface EnvironmentInterface<T, R = RequestInit> {
  readonly type: RuntimeEnvironment;
  createHeaders(headers?: Record<string, string>): Record<string, string>;
  handleResponse<U>(response: T): Promise<U>;
  getFingerprint(): Promise<string>;
  getPlatformInfo(): Promise<Record<string, unknown>>;
  getUserAgent(): string;
  setApiKey(apiKey: string): void;
  getApiKey(): string | undefined;
  isOnline(): boolean;
  fetch(url: string, options?: R): Promise<T>;
}
