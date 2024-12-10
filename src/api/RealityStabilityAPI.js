import { BaseAPI } from './BaseAPI';
export class RealityStabilityAPI extends BaseAPI {
    constructor(config) {
        super(config);
    }
    async getCurrentStability() {
        try {
            return await this.fetchApi('/reality-stability', {
                method: 'GET',
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get current stability: ${message}`);
        }
    }
}
