import { BaseAPI } from './BaseAPI';
export class FingerprintAPI extends BaseAPI {
    constructor(config) {
        super(config);
    }
    async createFingerprint(request) {
        try {
            return await this.fetchApi('/fingerprint', {
                method: 'POST',
                body: JSON.stringify(request),
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to create fingerprint: ${message}`);
        }
    }
    async getFingerprint(id) {
        try {
            return await this.fetchApi(`/fingerprint/${id}`, {
                method: 'GET',
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get fingerprint: ${message}`);
        }
    }
    async updateFingerprint(id, request) {
        try {
            return await this.fetchApi(`/fingerprint/${id}`, {
                method: 'PUT',
                body: JSON.stringify(request),
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to update fingerprint: ${message}`);
        }
    }
    async deleteFingerprint(id) {
        try {
            await this.fetchApi(`/fingerprint/${id}`, {
                method: 'DELETE',
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to delete fingerprint: ${message}`);
        }
    }
}
