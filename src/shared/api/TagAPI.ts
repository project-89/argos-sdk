import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, TagData } from '../interfaces/api';
import { HttpMethod } from '../interfaces/http';

export interface UpdateTagsRequest {
  tags: string[];
  metadata?: Record<string, any>;
}

export class TagAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  public async updateTags(
    fingerprintId: string,
    request: UpdateTagsRequest
  ): Promise<ApiResponse<TagData>> {
    try {
      return await this.fetchApi<TagData>(`/tag/${fingerprintId}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(request),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update tags: ${message}`);
    }
  }

  public async getTags(fingerprintId: string): Promise<ApiResponse<TagData>> {
    try {
      return await this.fetchApi<TagData>(`/tag/${fingerprintId}`, {
        method: HttpMethod.GET,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get tags: ${message}`);
    }
  }

  public async deleteTags(fingerprintId: string): Promise<void> {
    try {
      await this.fetchApi(`/tag/${fingerprintId}`, {
        method: HttpMethod.DELETE,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete tags: ${message}`);
    }
  }
}
