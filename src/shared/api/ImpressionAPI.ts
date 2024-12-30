import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import type {
  ApiResponse,
  ImpressionData,
  CreateImpressionRequest,
  GetImpressionsOptions,
  DeleteImpressionsResponse,
} from '../interfaces/api';
import {
  HttpMethod,
  CommonResponse,
  CommonRequestInit,
} from '../interfaces/http';

export class ImpressionAPI<
  T extends CommonResponse,
  R extends CommonRequestInit = CommonRequestInit
> extends BaseAPI<T, R> {
  constructor(config: BaseAPIConfig<T, R>) {
    super(config);
  }

  async createImpression(
    request: CreateImpressionRequest
  ): Promise<ApiResponse<ImpressionData>> {
    return this.fetchApi<ImpressionData>('/impressions', {
      method: HttpMethod.POST,
      body: request,
    });
  }

  async getImpressions(
    fingerprintId: string,
    options?: GetImpressionsOptions
  ): Promise<ApiResponse<ImpressionData[]>> {
    const queryParams = new URLSearchParams();
    if (options?.type) queryParams.append('type', options.type);
    if (options?.startTime) queryParams.append('startTime', options.startTime);
    if (options?.endTime) queryParams.append('endTime', options.endTime);
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.sessionId) queryParams.append('sessionId', options.sessionId);

    return this.fetchApi<ImpressionData[]>(
      `/impressions/${fingerprintId}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`,
      {
        method: HttpMethod.GET,
      }
    );
  }

  async deleteImpressions(
    fingerprintId: string,
    type?: string
  ): Promise<ApiResponse<DeleteImpressionsResponse>> {
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);

    return this.fetchApi<DeleteImpressionsResponse>(
      `/impressions/${fingerprintId}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`,
      {
        method: HttpMethod.DELETE,
      }
    );
  }
}
