import { BaseAPIConfig } from '../api/BaseAPI';
import type { Response as NodeResponse } from 'node-fetch';

/**
 * Runtime environment types supported by the SDK
 */
export enum RuntimeEnvironment {
  Browser = 'browser',
  Node = 'node',
}

/**
 * Storage interface for persisting data across sessions
 */
export interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Core environment interface that must be implemented by all environments
 */
export interface EnvironmentInterface<T = Response> {
  // Platform information
  isOnline(): boolean;
  getUserAgent(): string;
  getLanguage(): string;
  getPlatformInfo(): Promise<Record<string, unknown>>;
  getFingerprint(): Promise<string>;

  // Navigation
  getUrl(): string | null;
  getReferrer(): string | null;

  // API key management
  setApiKey(apiKey: string): void;
  getApiKey(): string | undefined;

  // HTTP utilities
  createHeaders(headers: Record<string, string>): Record<string, string>;
  handleResponse(response: T): Promise<unknown>;
  fetch(url: string, init?: RequestInit): Promise<T>;
}

export interface ServerSDKConfig extends BaseAPIConfig<NodeResponse> {
  defaultFingerprint?: string;
}
