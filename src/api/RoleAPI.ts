import { BaseAPI, BaseAPIConfig } from "./BaseAPI";
import { ApiResponse, RoleData } from "../types/api";

export interface RoleCreateRequest {
  name: string;
  permissions: string[];
}

export interface RoleUpdateRequest {
  name?: string;
  permissions?: string[];
}

export type RoleResponse = ApiResponse<RoleData>;

export class RoleAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  /**
   * List available roles (public endpoint)
   */
  public async listAvailableRoles(): Promise<ApiResponse<string[]>> {
    try {
      return await this.fetchApi<string[]>("/roles", {
        method: "GET",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list roles: ${message}`);
    }
  }

  /**
   * Add roles to a fingerprint (protected endpoint - requires API key)
   */
  public async addRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    try {
      return await this.fetchApi<RoleData>("/role", {
        method: "POST",
        body: JSON.stringify({
          fingerprintId,
          roles,
        }),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to add roles: ${message}`);
    }
  }

  /**
   * Get roles for a fingerprint (protected endpoint - requires API key)
   */
  public async getRoles(fingerprintId: string): Promise<ApiResponse<RoleData>> {
    try {
      return await this.fetchApi<RoleData>(`/role/${fingerprintId}`, {
        method: "GET",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get roles: ${message}`);
    }
  }

  /**
   * Remove roles from a fingerprint (protected endpoint - requires API key)
   */
  public async removeRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    try {
      return await this.fetchApi<RoleData>("/role", {
        method: "DELETE",
        body: JSON.stringify({
          fingerprintId,
          roles,
        }),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to remove roles: ${message}`);
    }
  }
}
