import { BaseAPI } from './BaseAPI';
export class TagAPI extends BaseAPI {
    constructor(config) {
        super(config);
    }
    async updateTags(fingerprintId, request) {
        try {
            return await this.fetchApi(`/tag/${fingerprintId}`, {
                method: 'PUT',
                body: JSON.stringify(request),
            });
        }
        catch (error) {
            throw new Error(`Failed to update tags: ${error instanceof Error ? error.message : error}`);
        }
    }
    async getTags(fingerprintId) {
        try {
            return await this.fetchApi(`/tag/${fingerprintId}`, {
                method: 'GET',
            });
        }
        catch (error) {
            throw new Error(`Failed to get tags: ${error instanceof Error ? error.message : error}`);
        }
    }
    async deleteTags(fingerprintId) {
        try {
            await this.fetchApi(`/tag/${fingerprintId}`, {
                method: 'DELETE',
            });
        }
        catch (error) {
            throw new Error(`Failed to delete tags: ${error instanceof Error ? error.message : error}`);
        }
    }
}
