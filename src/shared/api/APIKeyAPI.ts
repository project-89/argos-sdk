import { BaseAPI } from './BaseAPI';
import {
  ApiResponse,
  APIKeyData,
  CreateAPIKeyRequest,
  RevokeAPIKeyRequest,
  UpdateAPIKeyRequest,
} from '../interfaces/api';
import { HttpMethod } from '../interfaces/http';

export class APIKeyAPI extends BaseAPI {
  async validateAPIKey(apiKey: string): Promise<ApiResponse<boolean>> {
    return this.fetchApi<boolean>('/api-key/validate', {
      method: HttpMethod.POST,
      headers: {
        'x-api-key': apiKey,
      },
    });
  }

  async registerInitialApiKey(
    fingerprintId: string,
    metadata: Record<string, unknown>
  ): Promise<ApiResponse<APIKeyData>> {
    return this.fetchApi<APIKeyData>('/api-key/register', {
      method: HttpMethod.POST,
      body: {
        fingerprintId,
        metadata,
      },
    });
  }

  async createAPIKey(
    request: CreateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    return this.fetchApi<APIKeyData>('/api-key', {
      method: HttpMethod.POST,
      body: JSON.stringify(request),
    });
  }

  async revokeAPIKey(request: RevokeAPIKeyRequest): Promise<ApiResponse<void>> {
    return this.fetchApi<void>('/api-key/revoke', {
      method: HttpMethod.POST,
      body: JSON.stringify(request),
    });
  }

  async getAPIKey(id: string): Promise<ApiResponse<APIKeyData>> {
    return this.fetchApi<APIKeyData>(`/api-key/${id}`);
  }

  async listAPIKeys(): Promise<ApiResponse<APIKeyData[]>> {
    return this.fetchApi<APIKeyData[]>('/api-key');
  }

  async updateAPIKey(
    id: string,
    request: UpdateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    return this.fetchApi<APIKeyData>(`/api-key/${id}`, {
      method: HttpMethod.PUT,
      body: JSON.stringify(request),
    });
  }

  async deleteAPIKey(id: string): Promise<ApiResponse<boolean>> {
    return this.fetchApi<boolean>(`/api-key/${id}`, {
      method: HttpMethod.DELETE,
    });
  }
}
