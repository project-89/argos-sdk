import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, SystemHealthData } from '../interfaces/api';
import { HttpMethod, CommonResponse } from '../interfaces/http';

export class SystemAPI<T extends CommonResponse> extends BaseAPI<T> {
  constructor(config: BaseAPIConfig<T>) {
    super(config);
  }

  /**
   * Check system health
   */
  public async checkHealth(): Promise<ApiResponse<SystemHealthData>> {
    return this.fetchApi<SystemHealthData>('/health', {
      method: HttpMethod.GET,
    });
  }

  /**
   * Get available roles
   */
  public async getAvailableRoles(): Promise<ApiResponse<string[]>> {
    return this.fetchApi<string[]>('/role/available', {
      method: HttpMethod.GET,
    });
  }
}
