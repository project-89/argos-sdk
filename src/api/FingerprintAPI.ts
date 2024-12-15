/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseAPI, BaseAPIConfig } from "./BaseAPI";
import { ApiResponse, FingerprintData } from "../types/api";

export interface CreateFingerprintRequest {
  fingerprint: string;
  metadata?: Record<string, any>;
}

export interface UpdateFingerprintRequest {
  metadata?: Record<string, any>;
  tags?: Record<string, number>;
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
      return await this.fetchApi<FingerprintData>("/fingerprint/register", {
        method: "POST",
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
        method: "GET",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get fingerprint: ${message}`);
    }
  }

  /**
   * Update fingerprint data (protected endpoint - requires API key)
   */
  public async updateFingerprint(
    id: string,
    request: UpdateFingerprintRequest
  ): Promise<ApiResponse<FingerprintData>> {
    try {
      return await this.fetchApi<FingerprintData>(`/fingerprint/${id}`, {
        method: "PUT",
        body: JSON.stringify(request),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update fingerprint: ${message}`);
    }
  }
}
