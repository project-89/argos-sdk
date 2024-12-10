import { BaseAPI } from './BaseAPI';
export class VisitAPI extends BaseAPI {
    constructor(config) {
        super(config);
    }
    async createVisit(visit) {
        try {
            return await this.fetchApi('/visit', {
                method: 'POST',
                body: JSON.stringify(visit),
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to create visit: ${message}`);
        }
    }
    async getVisits() {
        try {
            return await this.fetchApi('/visit', {
                method: 'GET',
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get visits: ${message}`);
        }
    }
}
