import { BaseAPI } from './BaseAPI';
export class PriceAPI extends BaseAPI {
    constructor(config) {
        super(config);
    }
    async getCurrentPrice() {
        try {
            return await this.fetchApi('/price/current', {
                method: 'GET',
            });
        }
        catch (error) {
            throw new Error(`Failed to get current price: ${error instanceof Error ? error.message : error}`);
        }
    }
    async getPriceHistory(startDate, endDate) {
        try {
            let endpoint = '/price/history';
            if (startDate && endDate) {
                endpoint += `?startDate=${startDate}&endDate=${endDate}`;
            }
            return await this.fetchApi(endpoint, {
                method: 'GET',
            });
        }
        catch (error) {
            throw new Error(`Failed to get price history: ${error instanceof Error ? error.message : error}`);
        }
    }
}
