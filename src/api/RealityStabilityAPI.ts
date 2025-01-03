import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, RealityStabilityData } from '../types/api';

export class RealityStabilityAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  public async getCurrentStability(): Promise<
    ApiResponse<RealityStabilityData>
  > {
    try {
      return await this.fetchApi<RealityStabilityData>('/reality-stability', {
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get current stability: ${message}`);
    }
  }
}
