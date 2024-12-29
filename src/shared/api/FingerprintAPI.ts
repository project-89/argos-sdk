/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import type { ApiResponse, Fingerprint } from '../interfaces/api';
import { HttpMethod, CommonResponse } from '../interfaces/http';

interface CreateFingerprintOptions {
  metadata?: {
    [key: string]: any;
  };
}

export class FingerprintAPI<T extends CommonResponse> extends BaseAPI<T> {
  constructor(config: BaseAPIConfig<T>) {
    super(config);
  }

  async createFingerprint(
    fingerprint: string,
    options?: CreateFingerprintOptions
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fetchApi<Fingerprint>('/fingerprint/register', {
      method: HttpMethod.POST,
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
    data: Partial<Fingerprint>
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fetchApi<Fingerprint>(`/fingerprint/${id}`, {
      method: HttpMethod.PUT,
      body: data,
    });
  }

  async deleteFingerprint(id: string): Promise<ApiResponse<void>> {
    return this.fetchApi<void>(`/fingerprint/${id}`, {
      method: HttpMethod.DELETE,
    });
  }
}
