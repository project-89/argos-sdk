import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import {
  ApiResponse,
  ImpressionData,
  CreateImpressionRequest,
  GetImpressionsOptions,
  DeleteImpressionsResponse,
} from '../types/api';

export class ImpressionAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  /**
   * Create a new impression
   * POST /impressions
   */
  public async createImpression(
    request: CreateImpressionRequest
  ): Promise<ApiResponse<ImpressionData>> {
    try {
      return await this.fetchApi<ApiResponse<ImpressionData>>('/impressions', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create impression: ${message}`);
    }
  }

  /**
   * Get impressions for a fingerprint
   * GET /impressions/:fingerprintId
   */
  public async getImpressions(
    fingerprintId: string,
    options?: GetImpressionsOptions
  ): Promise<ApiResponse<ImpressionData[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.type) queryParams.set('type', options.type);
      if (options?.startTime) queryParams.set('startTime', options.startTime);
      if (options?.endTime) queryParams.set('endTime', options.endTime);
      if (options?.limit) queryParams.set('limit', String(options.limit));
      if (options?.sessionId) queryParams.set('sessionId', options.sessionId);

      const query = queryParams.toString();
      const url = `/impressions/${fingerprintId}${query ? `?${query}` : ''}`;

      return await this.fetchApi<ApiResponse<ImpressionData[]>>(url, {
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get impressions: ${message}`);
    }
  }

  /**
   * Delete impressions for a fingerprint
   * DELETE /impressions/:fingerprintId
   */
  public async deleteImpressions(
    fingerprintId: string,
    options?: GetImpressionsOptions
  ): Promise<ApiResponse<DeleteImpressionsResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.type) queryParams.set('type', options.type);
      if (options?.startTime) queryParams.set('startTime', options.startTime);
      if (options?.endTime) queryParams.set('endTime', options.endTime);
      if (options?.sessionId) queryParams.set('sessionId', options.sessionId);

      const query = queryParams.toString();
      const url = `/impressions/${fingerprintId}${query ? `?${query}` : ''}`;

      return await this.fetchApi<ApiResponse<DeleteImpressionsResponse>>(url, {
        method: 'DELETE',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete impressions: ${message}`);
    }
  }
}
