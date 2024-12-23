import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, SystemHealthData } from '../types/api';

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
        method: 'GET',
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
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get available roles: ${message}`);
    }
  }
}
