import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, APIKeyData } from '../types/api';

export interface CreateAPIKeyRequest {
  name: string;
  expiresAt?: string;
}

export interface UpdateAPIKeyRequest {
  name?: string;
  expiresAt?: string;
}

export interface RevokeAPIKeyRequest {
  key: string;
}

export class APIKeyAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  public async validateAPIKey(apiKey: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.fetchApi<{ success: boolean; data: boolean }>(
        '/api-key/validate',
        {
          method: 'POST',
          body: JSON.stringify({ key: apiKey }),
          isPublic: true,
        }
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to validate API key: ${message}`);
    }
  }

  public async registerInitialApiKey(
    fingerprintId: string,
    metadata: Record<string, any>
  ): Promise<ApiResponse<APIKeyData>> {
    try {
      const response = await this.fetchApi<{
        success: boolean;
        data: APIKeyData;
      }>('/api-key/register', {
        method: 'POST',
        body: JSON.stringify({
          fingerprintId,
          metadata,
          invalidateExisting: true,
        }),
        isPublic: true,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to register initial API key: ${message}`);
    }
  }

  public async createAPIKey(
    request: CreateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    try {
      const response = await this.fetchApi<{
        success: boolean;
        data: APIKeyData;
      }>('/api-key', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create API key: ${message}`);
    }
  }

  public async revokeAPIKey(
    request: RevokeAPIKeyRequest
  ): Promise<ApiResponse<void>> {
    try {
      const response = await this.fetchApi<{ success: boolean; data: void }>(
        '/api-key/revoke',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to revoke API key: ${message}`);
    }
  }

  public async getAPIKey(id: string): Promise<ApiResponse<APIKeyData>> {
    try {
      const response = await this.fetchApi<{
        success: boolean;
        data: APIKeyData;
      }>(`/api-key/${id}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get API key: ${message}`);
    }
  }

  public async listAPIKeys(): Promise<ApiResponse<APIKeyData[]>> {
    try {
      const response = await this.fetchApi<{
        success: boolean;
        data: APIKeyData[];
      }>('/api-key', {
        method: 'GET',
      });
      return response;
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
      const response = await this.fetchApi<{
        success: boolean;
        data: APIKeyData;
      }>(`/api-key/${id}`, {
        method: 'PUT',
        body: JSON.stringify(request),
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update API key: ${message}`);
    }
  }

  public async deleteAPIKey(key: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.fetchApi<{ success: boolean; data: boolean }>(
        `/api-key/${key}`,
        {
          method: 'DELETE',
        }
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete API key: ${message}`);
    }
  }
}
