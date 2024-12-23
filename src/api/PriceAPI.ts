import { BaseAPI } from './BaseAPI';
import {
  ApiResponse,
  PriceData,
  PriceHistoryData,
  GetCurrentPricesOptions,
  GetPriceHistoryOptions,
} from '../types/api';

export class PriceAPI extends BaseAPI {
  public async getCurrentPrices(
    options?: GetCurrentPricesOptions
  ): Promise<ApiResponse<PriceData>> {
    try {
      const queryParams = options
        ? new URLSearchParams(options as Record<string, string>)
        : '';
      const endpoint = `/price/current${queryParams ? `?${queryParams}` : ''}`;
      const response = await this.fetchApi<PriceData>(endpoint, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get current prices: ${message}`);
    }
  }

  public async getPriceHistory(
    tokenId: string,
    options?: GetPriceHistoryOptions
  ): Promise<ApiResponse<PriceHistoryData>> {
    try {
      const queryParams = options
        ? new URLSearchParams(options as Record<string, string>)
        : '';
      const endpoint = `/price/history/${tokenId}${queryParams ? `?${queryParams}` : ''}`;
      const response = await this.fetchApi<PriceHistoryData>(endpoint, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get price history: ${message}`);
    }
  }
}
