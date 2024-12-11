import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, VisitData } from '../types/api';

export type { VisitData } from '../types/api';

export interface PresenceData {
  fingerprintId: string;
  currentPage: string;
  timestamp?: string;
}

export class VisitAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  /**
   * Create a visit (public endpoint)
   */
  public async createVisit(
    visit: Omit<VisitData, 'id'>
  ): Promise<ApiResponse<void>> {
    try {
      await this.fetchApi<void>('/visit', {
        method: 'POST',
        body: JSON.stringify({
          ...visit,
          timestamp: visit.timestamp || new Date().toISOString(),
        }),
      });
      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create visit: ${message}`);
    }
  }

  /**
   * Update presence (public endpoint)
   */
  public async updatePresence(data: PresenceData): Promise<ApiResponse<void>> {
    try {
      await this.fetchApi<void>('/presence', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          timestamp: data.timestamp || new Date().toISOString(),
        }),
      });
      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update presence: ${message}`);
    }
  }
}
