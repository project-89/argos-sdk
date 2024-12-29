import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, DebugData } from '../interfaces/api';
import { HttpMethod, CommonResponse } from '../interfaces/http';

export class DebugAPI<T extends CommonResponse> extends BaseAPI<T> {
  constructor(config: BaseAPIConfig<T>) {
    super(config);
  }

  public async getDebugInfo(): Promise<ApiResponse<DebugData>> {
    try {
      return await this.fetchApi<DebugData>('/debug/info', {
        method: HttpMethod.GET,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get debug info: ${message}`);
    }
  }
}
