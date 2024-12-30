import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import type {
  ApiResponse,
  TagData,
  UpdateTagsRequest,
} from '../interfaces/api';
import {
  HttpMethod,
  CommonResponse,
  CommonRequestInit,
} from '../interfaces/http';

export class TagAPI<
  T extends CommonResponse,
  R extends CommonRequestInit = CommonRequestInit
> extends BaseAPI<T, R> {
  constructor(config: BaseAPIConfig<T, R>) {
    super(config);
  }

  async getTags(fingerprintId: string): Promise<ApiResponse<TagData>> {
    return this.fetchApi<TagData>(`/tag/${fingerprintId}`, {
      method: HttpMethod.GET,
    });
  }

  async updateTags(
    fingerprintId: string,
    request: UpdateTagsRequest
  ): Promise<ApiResponse<TagData>> {
    return this.fetchApi<TagData>(`/tag/${fingerprintId}`, {
      method: HttpMethod.PUT,
      body: request,
    });
  }

  async deleteTags(fingerprintId: string): Promise<ApiResponse<void>> {
    return this.fetchApi<void>(`/tag/${fingerprintId}`, {
      method: HttpMethod.DELETE,
    });
  }
}
