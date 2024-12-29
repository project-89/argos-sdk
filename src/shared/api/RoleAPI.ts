import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, RoleData } from '../interfaces/api';
import { HttpMethod, CommonResponse } from '../interfaces/http';

export interface RoleCreateRequest {
  name: string;
  permissions: string[];
}

export interface RoleUpdateRequest {
  name?: string;
  permissions?: string[];
}

export type RoleResponse = ApiResponse<RoleData>;

export class RoleAPI<T extends CommonResponse> extends BaseAPI<T> {
  constructor(config: BaseAPIConfig<T>) {
    super(config);
  }

  /**
   * List available roles (public endpoint)
   */
  public async listAvailableRoles(): Promise<ApiResponse<string[]>> {
    return this.fetchApi<string[]>('/role', {
      method: HttpMethod.GET,
    });
  }

  /**
   * Add roles to a fingerprint (protected endpoint - requires API key)
   */
  public async addRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    return this.fetchApi<RoleData>('/role', {
      method: HttpMethod.POST,
      body: {
        fingerprintId,
        roles,
      },
    });
  }

  /**
   * Get roles for a fingerprint (protected endpoint - requires API key)
   */
  public async getRoles(fingerprintId: string): Promise<ApiResponse<RoleData>> {
    return this.fetchApi<RoleData>(`/role/${fingerprintId}`, {
      method: HttpMethod.GET,
    });
  }

  /**
   * Remove roles from a fingerprint (protected endpoint - requires API key)
   */
  public async removeRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    return this.fetchApi<RoleData>('/role', {
      method: HttpMethod.DELETE,
      body: {
        fingerprintId,
        roles,
      },
    });
  }
}
