import { BaseAPI } from './BaseAPI';
import { ApiResponse } from '../interfaces/api';
import {
  CommonResponse,
  CommonRequestInit,
  HttpMethod,
} from '../interfaces/http';

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  version: string;
  uptime: number;
}

export interface RoleInfo {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export class SystemAPI<
  T extends CommonResponse = CommonResponse,
  R extends CommonRequestInit = CommonRequestInit
> extends BaseAPI<T, R> {
  async checkHealth(): Promise<ApiResponse<HealthCheckResponse>> {
    return this.fetchApi<HealthCheckResponse>('/health', {
      method: HttpMethod.GET,
    });
  }

  async getAvailableRoles(): Promise<ApiResponse<RoleInfo[]>> {
    return this.fetchApi<RoleInfo[]>('/roles', {
      method: HttpMethod.GET,
    });
  }
}
