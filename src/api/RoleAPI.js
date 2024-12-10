import { BaseAPI } from './BaseAPI';
export class RoleAPI extends BaseAPI {
    constructor(config) {
        super(config);
    }
    async addRoles(fingerprintId, roles) {
        try {
            return await this.fetchApi('/role', {
                method: 'POST',
                body: JSON.stringify({
                    fingerprintId,
                    roles,
                }),
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to add roles: ${message}`);
        }
    }
    async getRoles(fingerprintId) {
        try {
            return await this.fetchApi(`/role/${fingerprintId}`, {
                method: 'GET',
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get roles: ${message}`);
        }
    }
    async removeRoles(fingerprintId, roles) {
        try {
            return await this.fetchApi('/role', {
                method: 'DELETE',
                body: JSON.stringify({
                    fingerprintId,
                    roles,
                }),
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to remove roles: ${message}`);
        }
    }
}
