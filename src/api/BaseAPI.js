export class BaseAPI {
    constructor(config) {
        if (config) {
            if (typeof config === 'string') {
                BaseAPI.initialize({ baseUrl: '', apiKey: config });
            }
            else {
                BaseAPI.initialize(config);
            }
        }
    }
    static initialize(config) {
        BaseAPI.baseUrl = config.baseUrl;
        BaseAPI.apiKey = config.apiKey;
    }
    async fetchApi(endpoint, options = {}) {
        if (!BaseAPI.baseUrl || !BaseAPI.apiKey) {
            throw new Error('BaseAPI not initialized. Call initialize() first.');
        }
        const url = `${BaseAPI.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-API-Key': BaseAPI.apiKey,
            ...options.headers,
        };
        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.message || 'API request failed');
            }
            return {
                success: true,
                data: data.data,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Unknown error occurred');
        }
    }
}
