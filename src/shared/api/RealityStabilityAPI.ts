import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import type { ApiResponse } from '../interfaces/api';
import {
  HttpMethod,
  CommonResponse,
  CommonRequestInit,
} from '../interfaces/http';

interface RealityStabilityData {
  stability: number;
  factors: Record<string, unknown>;
}

export interface StabilityData {
  status: 'stable' | 'unstable';
  lastChecked: string;
  metrics: {
    [key: string]: number;
  };
}

export class RealityStabilityAPI<
  T extends CommonResponse,
  R extends CommonRequestInit = CommonRequestInit
> extends BaseAPI<T, R> {
  constructor(config: BaseAPIConfig<T, R>) {
    super(config);
  }

  async getStability(): Promise<ApiResponse<RealityStabilityData>> {
    return this.fetchApi<RealityStabilityData>('/reality-stability', {
      method: HttpMethod.GET,
    });
  }

  async getCurrentStability(): Promise<ApiResponse<StabilityData>> {
    return this.fetchApi<StabilityData>('/stability/current', {
      method: HttpMethod.GET,
    });
  }
}
