import { BaseAPI } from '../../../shared/api/BaseAPI';
import { ApiResponse } from '../../../shared/interfaces/api';

interface TestAPIConfig {
  baseUrl: string;
  maxRequestsPerHour?: number;
  maxRequestsPerMinute?: number;
  debug?: boolean;
  environment: any;
}

export class TestAPI extends BaseAPI<Response, RequestInit> {
  // Expose protected method for testing
  public async testFetchApi<U>(
    path: string,
    options?: any
  ): Promise<ApiResponse<U>> {
    return this.fetchApi<U>(path, options);
  }
}
