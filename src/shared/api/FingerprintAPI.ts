/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import type { ApiResponse, Fingerprint } from '../interfaces/api';
import {
  HttpMethod,
  CommonResponse,
  CommonRequestInit,
} from '../interfaces/http';

interface CreateFingerprintOptions {
  metadata?: Record<string, unknown>;
}

export class FingerprintAPI<
  T extends CommonResponse,
  R extends CommonRequestInit = CommonRequestInit
> extends BaseAPI<T, R> {
  constructor(config: BaseAPIConfig<T, R>) {
    super(config);
  }

  async createFingerprint(
    fingerprint: string,
    options?: CreateFingerprintOptions
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fetchApi<Fingerprint>('/fingerprint/register', {
      method: HttpMethod.POST,
      skipAuth: true,
      body: {
        fingerprint,
        ...(options?.metadata && { metadata: options.metadata }),
      },
    });
  }

  async getFingerprint(id: string): Promise<ApiResponse<Fingerprint>> {
    return this.fetchApi<Fingerprint>(`/fingerprint/${id}`, {
      method: HttpMethod.GET,
    });
  }

  async updateFingerprint(
    id: string,
    metadata: Record<string, unknown>
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fetchApi<Fingerprint>(`/fingerprint/${id}`, {
      method: HttpMethod.PUT,
      body: { metadata },
    });
  }

  async deleteFingerprint(id: string): Promise<ApiResponse<void>> {
    return this.fetchApi<void>(`/fingerprint/${id}`, {
      method: HttpMethod.DELETE,
    });
  }
}
