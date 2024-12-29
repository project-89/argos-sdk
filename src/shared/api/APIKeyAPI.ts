import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import {
  ApiResponse,
  APIKeyData,
  CreateAPIKeyRequest,
  RevokeAPIKeyRequest,
  UpdateAPIKeyRequest,
  ValidateAPIKeyResponse,
} from '../interfaces/api';
import { HttpMethod, CommonResponse } from '../interfaces/http';

export class APIKeyAPI<T extends CommonResponse> extends BaseAPI<T> {
  constructor(config: BaseAPIConfig<T>) {
    super(config);
  }

  async validateAPIKey(
    apiKey: string
  ): Promise<ApiResponse<ValidateAPIKeyResponse>> {
    return this.fetchApi<ValidateAPIKeyResponse>('/api-key/validate', {
      method: HttpMethod.POST,
      body: {
        key: apiKey,
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
      body: request,
    });
  }

  async revokeAPIKey(request: RevokeAPIKeyRequest): Promise<ApiResponse<void>> {
    return this.fetchApi<void>('/api-key/revoke', {
      method: HttpMethod.POST,
      body: request,
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
      body: request,
    });
  }

  async deleteAPIKey(id: string): Promise<ApiResponse<boolean>> {
    return this.fetchApi<boolean>(`/api-key/${id}`, {
      method: HttpMethod.DELETE,
    });
  }
}
