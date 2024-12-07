import { BaseAPI } from './BaseAPI';
import { ApiResponse } from '../types/api';

export interface CleanupResult {
  cleanupTime: number;
  itemsCleaned: {
    visits: number;
    presence: number;
    priceCache: number;
    rateLimitStats: number;
    rateLimitRequests: number;
  };
}

export class DebugAPI extends BaseAPI {
  /**
   * Perform cleanup operations on old data
   * @returns Promise resolving to the cleanup results
   */
  async cleanup(): Promise<CleanupResult> {
    try {
      const response = await this.post<CleanupResult>('/debug/cleanup');

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to perform cleanup');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to perform cleanup: ${error.message}`);
    }
  }
}
