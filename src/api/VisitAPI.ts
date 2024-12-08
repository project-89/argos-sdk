import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, VisitData } from '../types/api';

export class VisitAPI extends BaseAPI {
  constructor(config?: BaseAPIConfig) {
    super(config);
  }

  public async createVisit(visit: VisitData): Promise<ApiResponse<VisitData>> {
    try {
      return await this.fetchApi<VisitData>('/visit', {
        method: 'POST',
        body: JSON.stringify(visit),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create visit: ${message}`);
    }
  }

  public async getVisits(): Promise<ApiResponse<VisitData[]>> {
    try {
      return await this.fetchApi<VisitData[]>('/visit', {
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get visits: ${message}`);
    }
  }
}
