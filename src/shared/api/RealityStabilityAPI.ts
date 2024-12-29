import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, RealityStabilityData } from '../interfaces/api';
import { HttpMethod, CommonResponse } from '../interfaces/http';

export class RealityStabilityAPI<T extends CommonResponse> extends BaseAPI<T> {
  constructor(config: BaseAPIConfig<T>) {
    super(config);
  }

  public async getCurrentStability(): Promise<
    ApiResponse<RealityStabilityData>
  > {
    try {
      return await this.fetchApi<RealityStabilityData>('/reality-stability', {
        method: HttpMethod.GET,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get reality stability: ${message}`);
    }
  }
}
