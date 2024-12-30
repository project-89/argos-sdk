import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import type {
  ApiResponse,
  PriceData,
  PriceHistoryData,
  GetCurrentPricesOptions,
  GetPriceHistoryOptions,
} from '../interfaces/api';
import {
  HttpMethod,
  CommonResponse,
  CommonRequestInit,
} from '../interfaces/http';

export class PriceAPI<
  T extends CommonResponse,
  R extends CommonRequestInit = CommonRequestInit
> extends BaseAPI<T, R> {
  constructor(config: BaseAPIConfig<T, R>) {
    super(config);
  }

  async getCurrentPrices(
    options?: GetCurrentPricesOptions
  ): Promise<ApiResponse<PriceData>> {
    const queryParams = new URLSearchParams();
    if (options?.tokens) {
      queryParams.append('tokens', options.tokens.join(','));
    }

    return this.fetchApi<PriceData>(
      `/price/current${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`,
      {
        method: HttpMethod.GET,
      }
    );
  }

  async getPriceHistory(
    tokenId: string,
    options?: GetPriceHistoryOptions
  ): Promise<ApiResponse<PriceHistoryData>> {
    const queryParams = new URLSearchParams();
    if (options?.interval) queryParams.append('interval', options.interval);
    if (options?.limit) queryParams.append('limit', options.limit.toString());

    return this.fetchApi<PriceHistoryData>(
      `/price/history/${tokenId}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`,
      {
        method: HttpMethod.GET,
      }
    );
  }
}
