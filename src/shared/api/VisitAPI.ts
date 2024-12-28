import { BaseAPI } from './BaseAPI';
import {
  ApiResponse,
  VisitData,
  CreateVisitRequest,
  UpdatePresenceRequest,
  PresenceData,
  GetVisitHistoryOptions,
} from '../interfaces/api';
import { HttpMethod } from '../interfaces/http';

export class VisitAPI extends BaseAPI {
  async createVisit(
    request: CreateVisitRequest
  ): Promise<ApiResponse<VisitData>> {
    try {
      return await this.fetchApi<VisitData>('/visit/log', {
        method: HttpMethod.POST,
        body: request,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create visit: ${message}`);
    }
  }

  async updatePresence(
    request: UpdatePresenceRequest
  ): Promise<ApiResponse<PresenceData>> {
    try {
      return await this.fetchApi<PresenceData>('/visit/presence', {
        method: HttpMethod.POST,
        body: request,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update presence: ${message}`);
    }
  }

  async getVisitHistory(
    fingerprintId: string,
    options?: GetVisitHistoryOptions
  ): Promise<ApiResponse<{ visits: VisitData[] }>> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.limit) {
        queryParams.set('limit', String(options.limit));
      }
      if (options?.offset) {
        queryParams.set('offset', String(options.offset));
      }
      if (options?.startDate) {
        queryParams.set('startDate', options.startDate);
      }
      if (options?.endDate) {
        queryParams.set('endDate', options.endDate);
      }

      const query = queryParams.toString();
      const url = `/visit/history/${encodeURIComponent(fingerprintId)}${
        query ? `?${query}` : ''
      }`;

      return await this.fetchApi<{ visits: VisitData[] }>(url, {
        method: HttpMethod.GET,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get visit history: ${message}`);
    }
  }
}
