import { BaseAPI } from './BaseAPI';
import { ApiResponse, PriceData, PriceHistoryData } from '../interfaces/api';
import { HttpMethod } from '../interfaces/http';

export interface GetCurrentPricesOptions {
  tokens: string[];
}

export interface GetPriceHistoryOptions {
  interval?: string;
  limit?: number;
}

export class PriceAPI extends BaseAPI {
  async getCurrentPrices(
    options: GetCurrentPricesOptions
  ): Promise<ApiResponse<PriceData>> {
    try {
      return await this.fetchApi<PriceData>(
        `/price/current?tokens=${encodeURIComponent(options.tokens.join(','))}`,
        {
          method: HttpMethod.GET,
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get current prices: ${message}`);
    }
  }

  async getPriceHistory(
    token: string,
    options?: GetPriceHistoryOptions
  ): Promise<ApiResponse<PriceHistoryData>> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.interval) queryParams.set('interval', options.interval);
      if (options?.limit) queryParams.set('limit', String(options.limit));

      const query = queryParams.toString();
      const url = `/price/history/${encodeURIComponent(token)}${
        query ? `?${query}` : ''
      }`;

      return await this.fetchApi<PriceHistoryData>(url, {
        method: HttpMethod.GET,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get price history: ${message}`);
    }
  }
}
