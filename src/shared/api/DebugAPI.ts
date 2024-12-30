import { BaseAPI } from './BaseAPI';
import { ApiResponse } from '../interfaces/api';
import {
  CommonResponse,
  CommonRequestInit,
  HttpMethod,
} from '../interfaces/http';

export class DebugAPI<
  T extends CommonResponse = CommonResponse,
  R extends CommonRequestInit = CommonRequestInit
> extends BaseAPI<T, R> {
  async getDebugInfo(): Promise<ApiResponse<any>> {
    try {
      return await this.fetchApi('/debug', {
        method: HttpMethod.GET,
      });
    } catch (error: any) {
      throw new Error(`Failed to get debug info: ${error.message}`);
    }
  }
}
