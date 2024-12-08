import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, APIKeyData } from '../types/api';

export interface CreateAPIKeyRequest {
  name: string;
  permissions: string[];
}

export interface UpdateAPIKeyRequest {
  name?: string;
  permissions?: string[];
}

export class APIKeyAPI extends BaseAPI {
  constructor(config?: BaseAPIConfig) {
    super(config);
  }

  public async createAPIKey(
    request: CreateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    try {
      return await this.fetchApi<APIKeyData>('/api-key', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create API key: ${message}`);
    }
  }

  public async getAPIKey(id: string): Promise<ApiResponse<APIKeyData>> {
    try {
      return await this.fetchApi<APIKeyData>(`/api-key/${id}`, {
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get API key: ${message}`);
    }
  }

  public async listAPIKeys(): Promise<ApiResponse<APIKeyData[]>> {
    try {
      return await this.fetchApi<APIKeyData[]>('/api-key', {
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list API keys: ${message}`);
    }
  }

  public async updateAPIKey(
    id: string,
    request: UpdateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    try {
      return await this.fetchApi<APIKeyData>(`/api-key/${id}`, {
        method: 'PUT',
        body: JSON.stringify(request),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update API key: ${message}`);
    }
  }

  public async deleteAPIKey(id: string): Promise<void> {
    try {
      await this.fetchApi(`/api-key/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete API key: ${message}`);
    }
  }
}
