import { BaseAPI } from './BaseAPI';
import { ApiResponse } from '../types/api';

export interface RegisterApiKeyRequest {
  fingerprintId: string;
  name: string;
  metadata?: Record<string, any>;
  agentType?: string;
}

export interface RegisterApiKeyResponse {
  key: string;
  fingerprintId: string;
}

export interface ValidateApiKeyResponse {
  isValid: boolean;
  fingerprintId?: string;
}

export interface RevokeApiKeyResponse {
  message: string;
}

export class APIKeyAPI extends BaseAPI {
  /**
   * Register a new API key
   * @param request - The registration request containing fingerprintId and optional metadata
   * @returns Promise resolving to the new API key
   */
  async register(
    request: RegisterApiKeyRequest
  ): Promise<RegisterApiKeyResponse> {
    try {
      const response = await this.post<RegisterApiKeyResponse>(
        '/apiKey/register',
        request
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to register API key');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to register API key: ${error.message}`);
    }
  }

  /**
   * Validate an API key
   * @param key - The API key to validate
   * @returns Promise resolving to the validation result
   */
  async validate(key: string): Promise<ValidateApiKeyResponse> {
    try {
      const response = await this.post<ValidateApiKeyResponse>(
        '/apiKey/validate',
        { key }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to validate API key');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to validate API key: ${error.message}`);
    }
  }

  /**
   * Revoke an API key
   * @param key - The API key to revoke
   * @returns Promise resolving to the revocation result
   */
  async revoke(key: string): Promise<RevokeApiKeyResponse> {
    try {
      const response = await this.post<RevokeApiKeyResponse>('/apiKey/revoke', {
        key,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to revoke API key');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to revoke API key: ${error.message}`);
    }
  }
}
