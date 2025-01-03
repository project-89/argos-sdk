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

const RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;

// Error types that are considered transient and can be retried
const TRANSIENT_ERRORS = [
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'NETWORK_ERROR',
  'RATE_LIMIT',
];

export class APIKeyAPI<
  T extends CommonResponse = CommonResponse,
  R extends CommonRequestInit = CommonRequestInit
> extends BaseAPI<T, R> {
  private debug: boolean;
  private refreshThreshold: number;
  private autoRefresh: boolean;
  private currentFingerprintId?: string;

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

  private isTransientError(error: any): boolean {
    if (!error) return false;

    // Check error code
    if (error.code && TRANSIENT_ERRORS.includes(error.code)) {
      return true;
    }

    // Check error message
    const message = error.message || String(error);
    return (
      TRANSIENT_ERRORS.some((code) => message.includes(code)) ||
      message.includes('timeout') ||
      message.includes('rate limit')
    );
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    retries = MAX_RETRIES,
    delay = RETRY_DELAY
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && this.isTransientError(error)) {
        this.logDebug(
          `Retrying operation after error: ${error}. Retries left: ${retries}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.withRetry(operation, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async createAPIKey(
    request: CreateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    this.logDebug('Creating API key', { request });
    try {
      const response = await this.withRetry(() =>
        this.fetchApi<APIKeyData>('/api-key/register', {
          method: HttpMethod.POST,
          skipAuth: true,
          body: request,
        })
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to create API key');
      }

      if (response.data) {
        this.validateKeyFormat(response.data.key);
        // Store the fingerprint ID when we create a new key
        this.currentFingerprintId = response.data.fingerprintId;
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
    this.logDebug('Validating API key', { key });

    try {
      const response = await this.withRetry(() =>
        this.fetchApi<ValidateAPIKeyResponse>('/api-key/validate', {
          method: HttpMethod.POST,
          skipAuth: true,
          body: { key },
        })
      );

      if (!response.success) {
        throw new Error('Failed to validate API key');
      }

      this.logDebug('Validation response:', JSON.stringify(response, null, 2));

      if (response.data.needsRefresh && this.autoRefresh) {
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
      // First validate the current key
      const validation = await this.validateAPIKey(key);
      if (!validation.success) {
        throw new Error('Failed to validate current key');
      }

      // Use the stored fingerprint ID
      if (!this.currentFingerprintId) {
        throw new Error(
          'No fingerprint ID available. Please create a new API key.'
        );
      }

      // Create a new key using the stored fingerprint ID
      const response = await this.withRetry(() =>
        this.fetchApi<APIKeyData>('/api-key/register', {
          method: HttpMethod.POST,
          skipAuth: true,
          body: {
            name: `refreshed-key-${Date.now()}`,
            fingerprintId: this.currentFingerprintId,
            metadata: {
              refreshedFrom: key,
              refreshedAt: new Date().toISOString(),
            },
          },
        })
      );

      if (response.success && response.data) {
        const { key: newKey } = response.data;
        this.validateKeyFormat(newKey);
        this.environment.setApiKey(newKey);
        // Update stored fingerprint ID
        this.currentFingerprintId = response.data.fingerprintId;
        this.logDebug('API key refreshed successfully');
      }

      return {
        success: response.success,
        data: {
          key: response.data.key,
          fingerprintId: response.data.fingerprintId,
          expiresAt: response.data.expiresAt,
        },
      };
    } catch (error) {
      this.logError('Failed to refresh API key', error);
      throw error;
    }
  }

  async rotateAPIKey(key: string): Promise<ApiResponse<RotateAPIKeyResponse>> {
    this.validateKeyFormat(key);
    this.logDebug('Rotating API key');

    try {
      // First validate the current key
      const validation = await this.validateAPIKey(key);
      if (!validation.success) {
        throw new Error('Failed to validate current key');
      }

      // Use the stored fingerprint ID
      if (!this.currentFingerprintId) {
        throw new Error(
          'No fingerprint ID available. Please create a new API key.'
        );
      }

      // Create a new key using the stored fingerprint ID
      const response = await this.withRetry(() =>
        this.fetchApi<APIKeyData>('/api-key/register', {
          method: HttpMethod.POST,
          skipAuth: true,
          body: {
            name: `rotated-key-${Date.now()}`,
            fingerprintId: this.currentFingerprintId,
            metadata: {
              rotatedFrom: key,
              rotatedAt: new Date().toISOString(),
            },
          },
        })
      );

      if (response.success && response.data) {
        const { key: newKey } = response.data;
        this.validateKeyFormat(newKey);
        this.environment.setApiKey(newKey);
        // Update stored fingerprint ID
        this.currentFingerprintId = response.data.fingerprintId;
        this.logDebug('API key rotated successfully');
      }

      return {
        success: response.success,
        data: {
          key: response.data.key,
          fingerprintId: response.data.fingerprintId,
          expiresAt: response.data.expiresAt,
        },
      };
    } catch (error) {
      this.logError('Failed to rotate API key', error);
      throw error;
    }
  }

  async revokeAPIKey(request: RevokeAPIKeyRequest): Promise<ApiResponse<void>> {
    this.validateKeyFormat(request.key);
    this.logDebug('Revoking API key');

    try {
      const response = await this.withRetry(() =>
        this.fetchApi<void>('/api-key/revoke', {
          method: HttpMethod.POST,
          body: request,
        })
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to revoke API key');
      }

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
