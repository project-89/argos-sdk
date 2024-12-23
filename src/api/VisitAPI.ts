import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import {
  ApiResponse,
  VisitData,
  PresenceData,
  GetVisitHistoryOptions,
} from '../types/api';

export interface CreateVisitRequest {
  fingerprintId: string;
  url: string;
  title?: string;
  type?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePresenceRequest {
  fingerprintId: string;
  status: 'online' | 'offline';
  timestamp?: string;
  metadata?: Record<string, any>;
}

export class VisitAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

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
      throw new Error(`Failed to create visit: ${message}`);
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
    options?: GetVisitHistoryOptions
  ): Promise<ApiResponse<{ visits: VisitData[] }>> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.limit) queryParams.set('limit', String(options.limit));
      if (options?.offset) queryParams.set('offset', String(options.offset));
      if (options?.startDate) queryParams.set('startDate', options.startDate);
      if (options?.endDate) queryParams.set('endDate', options.endDate);

      const query = queryParams.toString();
      const url = `/visit/history/${fingerprintId}${query ? `?${query}` : ''}`;

      return await this.fetchApi<{ visits: VisitData[] }>(url, {
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get visit history: ${message}`);
    }
  }
}
