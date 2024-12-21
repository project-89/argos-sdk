import { BaseAPI } from './BaseAPI';
import {
  ApiResponse,
  VisitData,
  PresenceData,
  CreateVisitRequest,
  UpdatePresenceRequest,
} from '../types/api';

export class VisitAPI extends BaseAPI {
  public async createVisit(
    request: CreateVisitRequest
  ): Promise<ApiResponse<VisitData>> {
    try {
      return await this.fetchApi<VisitData>('/visit/log', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to log visit: ${message}`);
    }
  }

  public async updatePresence(
    request: UpdatePresenceRequest
  ): Promise<ApiResponse<PresenceData>> {
    try {
      return await this.fetchApi<PresenceData>('/visit/presence', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update presence: ${message}`);
    }
  }

  public async getVisitHistory(
    fingerprintId: string,
    options: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<ApiResponse<{ visits: VisitData[] }>> {
    try {
      const params = new URLSearchParams();

      // Add parameters in a consistent order
      if (options.limit !== undefined)
        params.append('limit', options.limit.toString());
      if (options.offset !== undefined)
        params.append('offset', options.offset.toString());
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const query = params.toString();
      const endpoint = `/visit/history/${fingerprintId}${query ? `?${query}` : ''}`;

      return await this.fetchApi<{ visits: VisitData[] }>(endpoint, {
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get visit history: ${message}`);
    }
  }
}
