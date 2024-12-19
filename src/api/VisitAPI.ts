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
  ): Promise<ApiResponse<void>> {
    return await this.fetchApi<void>('/visit/log', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  public async updatePresence(
    request: UpdatePresenceRequest
  ): Promise<ApiResponse<void>> {
    return await this.fetchApi<void>('/visit/presence', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}
