import { BaseAPI, BaseAPIConfig } from "./BaseAPI";
import { ApiResponse, TagData } from "../types/api";

export interface UpdateTagsRequest {
  tags: string[];
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
        method: "PUT",
        body: JSON.stringify(request),
      });
    } catch (error) {
      throw new Error(
        `Failed to update tags: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  public async getTags(fingerprintId: string): Promise<ApiResponse<TagData>> {
    try {
      return await this.fetchApi<TagData>(`/tag/${fingerprintId}`, {
        method: "GET",
      });
    } catch (error) {
      throw new Error(
        `Failed to get tags: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  public async deleteTags(fingerprintId: string): Promise<void> {
    try {
      await this.fetchApi(`/tag/${fingerprintId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(
        `Failed to delete tags: ${error instanceof Error ? error.message : error}`
      );
    }
  }
}
