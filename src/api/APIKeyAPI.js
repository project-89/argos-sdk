import { BaseAPI } from './BaseAPI';
export class APIKeyAPI extends BaseAPI {
    constructor(config) {
        super(config);
    }
    async createAPIKey(request) {
        try {
            return await this.fetchApi('/api-key', {
                method: 'POST',
                body: JSON.stringify(request),
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to create API key: ${message}`);
        }
    }
    async getAPIKey(id) {
        try {
            return await this.fetchApi(`/api-key/${id}`, {
                method: 'GET',
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get API key: ${message}`);
        }
    }
    async listAPIKeys() {
        try {
            return await this.fetchApi('/api-key', {
                method: 'GET',
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to list API keys: ${message}`);
        }
    }
    async updateAPIKey(id, request) {
        try {
            return await this.fetchApi(`/api-key/${id}`, {
                method: 'PUT',
                body: JSON.stringify(request),
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to update API key: ${message}`);
        }
    }
    async deleteAPIKey(id) {
        try {
            await this.fetchApi(`/api-key/${id}`, {
                method: 'DELETE',
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to delete API key: ${message}`);
        }
    }
}
