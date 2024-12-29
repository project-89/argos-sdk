import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, TagData } from '../interfaces/api';
import { HttpMethod, CommonResponse } from '../interfaces/http';

export interface UpdateTagsRequest {
  tags: string[];
  metadata?: Record<string, any>;
}

export class TagAPI<T extends CommonResponse> extends BaseAPI<T> {
  constructor(config: BaseAPIConfig<T>) {
    super(config);
  }

  public async updateTags(
    fingerprintId: string,
    request: UpdateTagsRequest
  ): Promise<ApiResponse<TagData>> {
    return this.fetchApi<TagData>(`/tag/${fingerprintId}`, {
      method: HttpMethod.PUT,
      body: request,
    });
  }

  public async getTags(fingerprintId: string): Promise<ApiResponse<TagData>> {
    return this.fetchApi<TagData>(`/tag/${fingerprintId}`, {
      method: HttpMethod.GET,
    });
  }

  public async deleteTags(fingerprintId: string): Promise<void> {
    await this.fetchApi(`/tag/${fingerprintId}`, {
      method: HttpMethod.DELETE,
    });
  }
}
