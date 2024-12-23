import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import {
  ApiResponse,
  PriceData,
  PriceHistoryData,
  GetPriceHistoryOptions,
} from '../types/api';

export class PriceAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  /**
   * Get current prices for specified tokens
   */
  public async getCurrentPrices(): Promise<ApiResponse<PriceData>> {
    try {
      return await this.fetchApi<PriceData>('/price/current', {
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get current prices: ${message}`);
    }
  }

  /**
   * Get price history for a token
   */
  public async getPriceHistory(
    tokenId: string,
    options?: GetPriceHistoryOptions
  ): Promise<ApiResponse<PriceHistoryData>> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.interval) queryParams.set('interval', options.interval);
      if (options?.limit) queryParams.set('limit', String(options.limit));

      const query = queryParams.toString();
      const url = `/price/history/${tokenId}${query ? `?${query}` : ''}`;

      return await this.fetchApi<PriceHistoryData>(url, {
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get price history: ${message}`);
    }
  }
}
