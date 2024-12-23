import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import {
  ApiResponse,
  PriceData,
  PriceHistoryData,
  GetCurrentPricesOptions,
  GetPriceHistoryOptions,
} from '../types/api';

export class PriceAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  /**
   * Get current prices for specified tokens
   */
  public async getCurrentPrices(
    options?: GetCurrentPricesOptions
  ): Promise<ApiResponse<PriceData>> {
    try {
      const params = new URLSearchParams();
      if (options?.tokens) {
        params.append('tokens', options.tokens.join(','));
      }

      const query = params.toString();
      const endpoint = `/price/current${query ? `?${query}` : ''}`;

      return await this.fetchApi<PriceData>(endpoint, {
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
      const params = new URLSearchParams();
      if (options?.interval) {
        params.append('interval', options.interval);
      }
      if (options?.limit) {
        params.append('limit', options.limit.toString());
      }

      const query = params.toString();
      const endpoint = `/price/history/${tokenId}${query ? `?${query}` : ''}`;

      return await this.fetchApi<PriceHistoryData>(endpoint, {
        method: 'GET',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get price history: ${message}`);
    }
  }
}
