import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, FingerprintData } from '../types/api';

export interface CreateFingerprintRequest {
  userAgent: string;
  ip: string;
  metadata: Record<string, any>;
}

export interface UpdateFingerprintRequest {
  userAgent?: string;
  metadata?: Record<string, any>;
}

export class FingerprintAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  /**
   * Create a fingerprint (public endpoint)
   */
  public async createFingerprint(
    request: CreateFingerprintRequest
  ): Promise<ApiResponse<FingerprintData>> {
    try {
      return await this.fetchApi<FingerprintData>('/fingerprint', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create fingerprint: ${message}`);
    }
  }

  /**
   * Get fingerprint by ID (public endpoint)
   */
  public async getFingerprint(
    id: string
  ): Promise<ApiResponse<FingerprintData>> {
    try {
      return await this.fetchApi<FingerprintData>(`/fingerprint/${id}`, {
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get fingerprint: ${message}`);
    }
  }

  /**
   * Update fingerprint (protected endpoint - requires API key)
   */
  public async updateFingerprint(
    id: string,
    request: UpdateFingerprintRequest
  ): Promise<ApiResponse<FingerprintData>> {
    try {
      return await this.fetchApi<FingerprintData>(`/fingerprint/${id}`, {
        method: 'PUT',
        body: JSON.stringify(request),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update fingerprint: ${message}`);
    }
  }

  /**
   * Delete fingerprint (protected endpoint - requires API key)
   */
  public async deleteFingerprint(id: string): Promise<void> {
    try {
      await this.fetchApi(`/fingerprint/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete fingerprint: ${message}`);
    }
  }
}
