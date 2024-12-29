import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import {
  ApiResponse,
  ImpressionData,
  CreateImpressionRequest,
  GetImpressionsOptions,
  DeleteImpressionsResponse,
} from '../interfaces/api';
import { HttpMethod, CommonResponse } from '../interfaces/http';

export class ImpressionAPI<T extends CommonResponse> extends BaseAPI<T> {
  constructor(config: BaseAPIConfig<T>) {
    super(config);
  }

  /**
   * Create a new impression
   * POST /impressions
   */
  public async createImpression(
    request: CreateImpressionRequest
  ): Promise<ApiResponse<ImpressionData>> {
    return this.fetchApi<ImpressionData>('/impressions', {
      method: HttpMethod.POST,
      body: request,
    });
  }

  /**
   * Get impressions for a fingerprint
   * GET /impressions/:fingerprintId
   */
  public async getImpressions(
    fingerprintId: string,
    options?: GetImpressionsOptions
  ): Promise<ApiResponse<ImpressionData[]>> {
    const queryParams = new URLSearchParams();
    if (options?.type) queryParams.set('type', options.type);
    if (options?.startTime) queryParams.set('startTime', options.startTime);
    if (options?.endTime) queryParams.set('endTime', options.endTime);
    if (options?.limit) queryParams.set('limit', String(options.limit));
    if (options?.sessionId) queryParams.set('sessionId', options.sessionId);

    const query = queryParams.toString();
    const url = `/impressions/${fingerprintId}${query ? `?${query}` : ''}`;

    return this.fetchApi<ImpressionData[]>(url, {
      method: HttpMethod.GET,
    });
  }

  /**
   * Delete impressions for a fingerprint
   * DELETE /impressions/:fingerprintId
   */
  public async deleteImpressions(
    fingerprintId: string,
    options?: GetImpressionsOptions
  ): Promise<ApiResponse<DeleteImpressionsResponse>> {
    const queryParams = new URLSearchParams();
    if (options?.type) queryParams.set('type', options.type);
    if (options?.startTime) queryParams.set('startTime', options.startTime);
    if (options?.endTime) queryParams.set('endTime', options.endTime);
    if (options?.sessionId) queryParams.set('sessionId', options.sessionId);

    const query = queryParams.toString();
    const url = `/impressions/${fingerprintId}${query ? `?${query}` : ''}`;

    return this.fetchApi<DeleteImpressionsResponse>(url, {
      method: HttpMethod.DELETE,
    });
  }
}
