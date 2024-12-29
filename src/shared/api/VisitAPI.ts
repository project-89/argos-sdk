import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import {
  ApiResponse,
  VisitData,
  CreateVisitRequest,
  UpdatePresenceRequest,
  PresenceData,
} from '../interfaces/api';
import { HttpMethod, CommonResponse } from '../interfaces/http';

export class VisitAPI<T extends CommonResponse> extends BaseAPI<T> {
  constructor(config: BaseAPIConfig<T>) {
    super(config);
  }

  async createVisit(
    request: CreateVisitRequest
  ): Promise<ApiResponse<VisitData>> {
    return this.fetchApi<VisitData>('/visit/create', {
      method: HttpMethod.POST,
      body: request,
    });
  }

  async getVisit(id: string): Promise<ApiResponse<VisitData>> {
    return this.fetchApi<VisitData>(`/visit/${id}`, {
      method: HttpMethod.GET,
    });
  }

  async updatePresence(
    request: UpdatePresenceRequest
  ): Promise<ApiResponse<PresenceData>> {
    return this.fetchApi<PresenceData>('/visit/presence', {
      method: HttpMethod.POST,
      body: request,
    });
  }

  async getVisitHistory(
    fingerprintId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<{ visits: VisitData[] }>> {
    const queryParams = new URLSearchParams();
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset)
      queryParams.append('offset', options.offset.toString());

    return this.fetchApi<{ visits: VisitData[] }>(
      `/visit/history/${fingerprintId}?${queryParams.toString()}`,
      {
        method: HttpMethod.GET,
      }
    );
  }
}
