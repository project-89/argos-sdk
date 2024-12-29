import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, PriceData, PriceHistoryData } from '../interfaces/api';
import { HttpMethod, CommonResponse } from '../interfaces/http';

export interface GetCurrentPricesOptions {
  tokens: string[];
}

export interface GetPriceHistoryOptions {
  interval?: string;
  limit?: number;
}

export class PriceAPI<T extends CommonResponse> extends BaseAPI<T> {
  constructor(config: BaseAPIConfig<T>) {
    super(config);
  }

  async getCurrentPrices(
    options: GetCurrentPricesOptions
  ): Promise<ApiResponse<PriceData>> {
    return this.fetchApi<PriceData>(
      `/price/current?tokens=${encodeURIComponent(options.tokens.join(','))}`,
      {
        method: HttpMethod.GET,
      }
    );
  }

  async getPriceHistory(
    token: string,
    options?: GetPriceHistoryOptions
  ): Promise<ApiResponse<PriceHistoryData>> {
    const queryParams = new URLSearchParams();
    if (options?.interval) queryParams.set('interval', options.interval);
    if (options?.limit) queryParams.set('limit', String(options.limit));

    const query = queryParams.toString();
    const url = `/price/history/${encodeURIComponent(token)}${
      query ? `?${query}` : ''
    }`;

    return this.fetchApi<PriceHistoryData>(url, {
      method: HttpMethod.GET,
    });
  }
}
