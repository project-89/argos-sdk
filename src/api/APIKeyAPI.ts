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

export class APIKeyAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  /**
   * Validate an API key (public endpoint)
   */
  public async validateAPIKey(apiKey: string): Promise<ApiResponse<boolean>> {
    try {
      return await this.fetchApi<boolean>('/api-key/validate', {
        method: 'POST',
        body: JSON.stringify({ apiKey }),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to validate API key: ${message}`);
    }
  }

  /**
   * Create an API key (protected endpoint - requires API key)
   */
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

  /**
   * Get API key by ID (protected endpoint - requires API key)
   */
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

  /**
   * List all API keys (protected endpoint - requires API key)
   */
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

  /**
   * Update an API key (protected endpoint - requires API key)
   */
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

  /**
   * Delete an API key (protected endpoint - requires API key)
   */
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
