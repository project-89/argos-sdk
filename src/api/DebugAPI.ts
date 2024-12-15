import { BaseAPI, BaseAPIConfig } from "./BaseAPI";
import { ApiResponse, DebugData } from "../types/api";

export class DebugAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  public async getDebugInfo(): Promise<ApiResponse<DebugData>> {
    try {
      return await this.fetchApi<DebugData>("/debug/info", {
        method: "GET",
      });
    } catch (error) {
      throw new Error(
        `Failed to get debug info: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
}
