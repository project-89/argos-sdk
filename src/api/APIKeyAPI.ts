import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse } from '../types/api';

export interface APIKeyData {
  key: string;
  fingerprintId: string;
  expiresAt: string;
}

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
      return await this.fetchApi<boolean>('/api-key/validate', {
        method: 'POST',
        body: JSON.stringify({ key: apiKey }),
        isPublic: true,
      });
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
      return await this.fetchApi<APIKeyData>('/api-key/register', {
        method: 'POST',
        body: JSON.stringify({
          fingerprintId,
          metadata,
        }),
        isPublic: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to register initial API key: ${message}`);
    }
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

  public async revokeAPIKey(
    request: RevokeAPIKeyRequest
  ): Promise<ApiResponse<void>> {
    try {
      return await this.fetchApi<void>('/api-key/revoke', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to revoke API key: ${message}`);
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
