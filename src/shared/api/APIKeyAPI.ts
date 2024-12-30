import { BaseAPI } from './BaseAPI';
import {
  ApiResponse,
  CreateAPIKeyRequest,
  ValidateAPIKeyRequest,
  ValidateAPIKeyResponse,
  RevokeAPIKeyRequest,
  APIKeyData,
} from '../interfaces/api';
import {
  CommonResponse,
  CommonRequestInit,
  HttpMethod,
} from '../interfaces/http';

export interface APIKeyMetadata {
  [key: string]: unknown;
}

export class APIKeyAPI<
  T extends CommonResponse = CommonResponse,
  R extends CommonRequestInit = CommonRequestInit
> extends BaseAPI<T, R> {
  async registerInitialApiKey(
    fingerprintId: string,
    metadata: APIKeyMetadata
  ): Promise<ApiResponse<APIKeyData>> {
    return this.fetchApi<APIKeyData>('/api-key/register', {
      method: HttpMethod.POST,
      body: {
        fingerprintId,
        metadata,
      },
      skipAuth: true,
    });
  }

  async createAPIKey(
    request: CreateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    return this.fetchApi<APIKeyData>('/api-key/register', {
      method: HttpMethod.POST,
      body: request,
      skipAuth: true,
    });
  }

  async validateAPIKey(
    key: string
  ): Promise<ApiResponse<ValidateAPIKeyResponse>> {
    return this.fetchApi<ValidateAPIKeyResponse>('/api-key/validate', {
      method: HttpMethod.POST,
      body: { key },
    });
  }

  async revokeAPIKey(request: RevokeAPIKeyRequest): Promise<ApiResponse<void>> {
    return this.fetchApi<void>('/api-key/revoke', {
      method: HttpMethod.POST,
      body: request,
    });
  }
}
