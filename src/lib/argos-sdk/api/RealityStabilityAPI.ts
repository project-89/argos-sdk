import { BaseAPI } from './BaseAPI';
import { ApiResponse } from '../types/api';

export type MatrixIntegrity =
  | 'STABLE'
  | 'FLUCTUATING'
  | 'UNSTABLE'
  | 'CRITICAL';

export interface RealityStabilityResponse {
  stabilityIndex: number;
  currentPrice: number;
  priceChange: number;
  timestamp: number;
}

export class RealityStabilityAPI extends BaseAPI {
  /**
   * Get the current reality stability index
   * @returns Promise resolving to the reality stability data
   */
  async getIndex(): Promise<RealityStabilityResponse> {
    try {
      const response =
        await this.get<RealityStabilityResponse>('/reality-stability');

      if (!response.success || !response.data) {
        throw new Error(
          response.error || 'Failed to get reality stability index'
        );
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get reality stability index: ${error.message}`
      );
    }
  }
}
