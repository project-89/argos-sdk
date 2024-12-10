import { BaseAPI } from './api/BaseAPI';
export class ArgosTracker extends BaseAPI {
    constructor(config) {
        super(config);
        this.user = null;
    }
    getUser() {
        return this.user;
    }
    async setUser(user) {
        const response = await this.fetchApi('/user', {
            method: 'POST',
            body: JSON.stringify(user),
        });
        this.user = response.data;
    }
    async updateUser(user) {
        const response = await this.fetchApi(`/user/${user.id}`, {
            method: 'PUT',
            body: JSON.stringify(user),
        });
        this.user = response.data;
    }
    async deleteUser() {
        if (!this.user)
            return;
        await this.fetchApi(`/user/${this.user.id}`, {
            method: 'DELETE',
        });
        this.user = null;
    }
}
