import { BaseAPI, BaseAPIConfig } from './BaseAPI';
import { ApiResponse, PriceData } from '../types/api';

export class PriceAPI extends BaseAPI {
  constructor(config?: BaseAPIConfig) {
    super(config);
  }

  public async getCurrentPrice(): Promise<ApiResponse<PriceData>> {
    try {
      return await this.fetchApi<PriceData>('/price/current', {
        method: 'GET',
      });
    } catch (error) {
      throw new Error(
        `Failed to get current price: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  public async getPriceHistory(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<PriceData[]>> {
    try {
      let endpoint = '/price/history';
      if (startDate && endDate) {
        endpoint += `?startDate=${startDate}&endDate=${endDate}`;
      }

      return await this.fetchApi<PriceData[]>(endpoint, {
        method: 'GET',
      });
    } catch (error) {
      throw new Error(
        `Failed to get price history: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
}
