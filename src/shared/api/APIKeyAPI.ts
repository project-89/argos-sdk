/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import type {
  ApiResponse,
  CreateAPIKeyRequest,
  ValidateAPIKeyResponse,
  APIKeyData,
} from '../interfaces/api';
import {
  HttpMethod,
  CommonResponse,
  CommonRequestInit,
} from '../interfaces/http';

export class APIKeyAPI<
  T extends CommonResponse,
  R extends CommonRequestInit = CommonRequestInit
> extends BaseAPI<T, R> {
  constructor(config: BaseAPIConfig<T, R>) {
    super(config);
  }

  async createAPIKey(
    request: CreateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    return this.fetchApi<APIKeyData>('/api-key/register', {
      method: HttpMethod.POST,
      skipAuth: true,
      body: request,
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

  async revokeAPIKey(request: {
    key: string;
  }): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetchApi<{ success: boolean }>('/api-key/revoke', {
      method: HttpMethod.POST,
      body: request,
    });
  }
}
