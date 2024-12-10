import { BaseAPI } from './BaseAPI';
export class DebugAPI extends BaseAPI {
    constructor(config) {
        super(config);
    }
    async getDebugInfo() {
        try {
            return await this.fetchApi('/debug/info', {
                method: 'GET',
            });
        }
        catch (error) {
            throw new Error(`Failed to get debug info: ${error instanceof Error ? error.message : error}`);
        }
    }
}
