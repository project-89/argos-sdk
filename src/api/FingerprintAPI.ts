/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, Fingerprint } from '../types/api';

export interface CreateFingerprintRequest {
  fingerprint: string;
  metadata?: {
    source?: string;
    userAgent?: string;
    language?: string;
    platform?: string;
    [key: string]: any;
  };
}

export class FingerprintAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  /**
   * Create a new fingerprint
   */
  public async createFingerprint(
    request: CreateFingerprintRequest
  ): Promise<ApiResponse<Fingerprint>> {
    if (this.debug) {
      console.log('[Argos] Creating fingerprint with request:', request);
    }

    const response = await this.fetchApi<ApiResponse<Fingerprint>>(
      '/fingerprint/register',
      {
        method: 'POST',
        body: JSON.stringify({
          fingerprint: request.fingerprint,
          metadata: request.metadata || {},
        }),
        isPublic: true,
      }
    );

    return response;
  }

  /**
   * Get fingerprint by ID
   */
  public async getFingerprint(id: string): Promise<ApiResponse<Fingerprint>> {
    try {
      return await this.fetchApi<ApiResponse<Fingerprint>>(
        `/fingerprint/${id}`,
        {
          method: 'GET',
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get fingerprint: ${message}`);
    }
  }

  /**
   * Update fingerprint metadata
   */
  public async updateFingerprint(data: {
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<Fingerprint>> {
    try {
      return await this.fetchApi<ApiResponse<Fingerprint>>(
        '/fingerprint/update',
        {
          method: 'POST',
          body: JSON.stringify({
            metadata: data.metadata || {},
          }),
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update fingerprint: ${message}`);
    }
  }
}
