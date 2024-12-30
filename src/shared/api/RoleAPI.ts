import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import type { ApiResponse, RoleData } from '../interfaces/api';
import {
  HttpMethod,
  CommonResponse,
  CommonRequestInit,
} from '../interfaces/http';

export class RoleAPI<
  T extends CommonResponse,
  R extends CommonRequestInit = CommonRequestInit
> extends BaseAPI<T, R> {
  constructor(config: BaseAPIConfig<T, R>) {
    super(config);
  }

  async getAvailableRoles(): Promise<ApiResponse<string[]>> {
    return this.fetchApi<string[]>('/role/available', {
      method: HttpMethod.GET,
    });
  }

  async addRolesToFingerprint(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    return this.fetchApi<RoleData>('/role', {
      method: HttpMethod.POST,
      body: { fingerprintId, roles },
    });
  }

  async getFingerprintRoles(
    fingerprintId: string
  ): Promise<ApiResponse<RoleData>> {
    return this.fetchApi<RoleData>(`/role/${fingerprintId}`, {
      method: HttpMethod.GET,
    });
  }

  async removeRolesFromFingerprint(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    return this.fetchApi<RoleData>('/role', {
      method: HttpMethod.DELETE,
      body: { fingerprintId, roles },
    });
  }
}
