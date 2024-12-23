/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, Fingerprint } from '../types/api';

export interface CreateFingerprintRequest {
  fingerprint: string;
  metadata?: Record<string, any>;
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
    try {
      return await this.fetchApi<Fingerprint>('/fingerprint/register', {
        method: 'POST',
        body: JSON.stringify(request),
        isPublic: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create fingerprint: ${message}`);
    }
  }

  /**
   * Get fingerprint by ID
   */
  public async getFingerprint(id: string): Promise<ApiResponse<Fingerprint>> {
    try {
      return await this.fetchApi<Fingerprint>(`/fingerprint/${id}`, {
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get fingerprint: ${message}`);
    }
  }

  /**
   * Update fingerprint metadata
   */
  public async updateFingerprint(
    id: string,
    data: { metadata?: Record<string, any> }
  ): Promise<ApiResponse<Fingerprint>> {
    try {
      return await this.fetchApi<Fingerprint>(`/fingerprint/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update fingerprint: ${message}`);
    }
  }
}
