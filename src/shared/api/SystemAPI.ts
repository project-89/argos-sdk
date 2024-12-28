import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, SystemHealthData } from '../interfaces/api';
import { HttpMethod } from '../interfaces/http';

export class SystemAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  /**
   * Check system health
   */
  public async checkHealth(): Promise<ApiResponse<SystemHealthData>> {
    try {
      return await this.fetchApi<SystemHealthData>('/health', {
        method: HttpMethod.GET,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to check system health: ${message}`);
    }
  }

  /**
   * Get available roles
   */
  public async getAvailableRoles(): Promise<ApiResponse<string[]>> {
    try {
      return await this.fetchApi<string[]>('/role/available', {
        method: HttpMethod.GET,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get available roles: ${message}`);
    }
  }
}
