/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseAPI } from './BaseAPI';
import type {
  APIKeyData,
  CreateAPIKeyRequest,
  ValidateAPIKeyResponse,
  RefreshAPIKeyResponse,
  RotateAPIKeyResponse,
  RevokeAPIKeyRequest,
  ApiResponse,
} from '../interfaces/api';
import { HttpMethod } from '../interfaces/http';
import type { CommonResponse, CommonRequestInit } from '../interfaces/http';
import type { EnvironmentInterface } from '../interfaces/environment';

export class APIKeyAPI<
  T extends CommonResponse = CommonResponse,
  R extends CommonRequestInit = CommonRequestInit
> extends BaseAPI<T, R> {
  private debug: boolean;
  private refreshThreshold: number;
  private autoRefresh: boolean;

  constructor({
    baseUrl,
    environment,
    refreshThreshold = 3600000, // 1 hour
    autoRefresh = true,
    debug = false,
  }: {
    baseUrl: string;
    environment: EnvironmentInterface<T, R>;
    refreshThreshold?: number;
    autoRefresh?: boolean;
    debug?: boolean;
  }) {
    super({ baseUrl, environment });
    this.refreshThreshold = refreshThreshold;
    this.autoRefresh = autoRefresh;
    this.debug = debug;
  }

  private logDebug(message: string, ...args: any[]) {
    if (this.debug) {
      console.debug(`[APIKeyAPI] ${message}`, ...args);
    }
  }

  private logError(message: string, error?: any) {
    console.error(`[APIKeyAPI] ${message}`, error);
  }

  private validateKeyFormat(key: string): boolean {
    if (!key) {
      throw new Error('API key must be a non-empty string');
    }

    // Base64 pattern for encrypted keys
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    if (!base64Pattern.test(key)) {
      throw new Error('Invalid API key format');
    }

    // Additional length validation for base64 encoded AES-256-CBC encrypted string
    if (key.length < 32) {
      throw new Error('Invalid API key format: key too short');
    }

    return true;
  }

  async createAPIKey(
    request: CreateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    this.logDebug('Creating API key', { request });
    try {
      const response = await this.fetchApi<APIKeyData>('/api-key/register', {
        method: HttpMethod.POST,
        skipAuth: true,
        body: request,
      });

      if (response.success && response.data) {
        this.validateKeyFormat(response.data.key);
      }

      return response;
    } catch (error) {
      this.logError('Failed to create API key', error);
      throw error;
    }
  }

  async validateAPIKey(
    key: string
  ): Promise<ApiResponse<ValidateAPIKeyResponse>> {
    this.validateKeyFormat(key);
    this.logDebug('Validating API key');

    try {
      const response = await this.fetchApi<ValidateAPIKeyResponse>(
        '/api-key/validate',
        {
          method: HttpMethod.POST,
          body: { key },
        }
      );

      if (
        response.success &&
        response.data &&
        response.data.needsRefresh &&
        this.autoRefresh
      ) {
        this.logDebug('API key needs refresh, initiating auto-refresh');
        this.refreshAPIKey(key).catch((error) => {
          this.logError('Auto-refresh failed', error);
        });
      }

      return response;
    } catch (error) {
      this.logError('Failed to validate API key', error);
      throw error;
    }
  }

  async refreshAPIKey(
    key: string
  ): Promise<ApiResponse<RefreshAPIKeyResponse>> {
    this.validateKeyFormat(key);
    this.logDebug('Refreshing API key');

    try {
      const response = await this.fetchApi<RefreshAPIKeyResponse>(
        '/api-key/refresh',
        {
          method: HttpMethod.POST,
          body: { key },
        }
      );

      if (response.success && response.data) {
        const { newKey } = response.data;
        this.validateKeyFormat(newKey);
        this.environment.setApiKey(newKey);
        this.logDebug('API key refreshed successfully');
      }

      return response;
    } catch (error) {
      this.logError('Failed to refresh API key', error);
      throw error;
    }
  }

  async rotateAPIKey(key: string): Promise<ApiResponse<RotateAPIKeyResponse>> {
    this.validateKeyFormat(key);
    this.logDebug('Rotating API key');

    try {
      const response = await this.fetchApi<RotateAPIKeyResponse>(
        '/api-key/rotate',
        {
          method: HttpMethod.POST,
          body: { key },
        }
      );

      if (response.success && response.data) {
        const { newKey } = response.data;
        this.validateKeyFormat(newKey);
        this.environment.setApiKey(newKey);
        this.logDebug('API key rotated successfully');
      }

      return response;
    } catch (error) {
      this.logError('Failed to rotate API key', error);
      throw error;
    }
  }

  async revokeAPIKey(request: RevokeAPIKeyRequest): Promise<ApiResponse<void>> {
    this.validateKeyFormat(request.key);
    this.logDebug('Revoking API key');

    try {
      const response = await this.fetchApi<void>('/api-key/revoke', {
        method: HttpMethod.POST,
        body: request,
      });

      if (response.success) {
        this.logDebug('API key revoked successfully');
      }

      return response;
    } catch (error) {
      this.logError('Failed to revoke API key', error);
      throw error;
    }
  }
}
