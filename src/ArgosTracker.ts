import { BaseAPI, BaseAPIConfig } from './api/BaseAPI';
import { ArgosUser, ApiResponse } from './types/api';

export class ArgosTracker extends BaseAPI {
  private user: ArgosUser | null = null;

  constructor(config: BaseAPIConfig) {
    super(config);
  }

  public getUser(): ArgosUser | null {
    return this.user;
  }

  public async setUser(user: ArgosUser): Promise<void> {
    try {
      const response = await this.fetchApi<ArgosUser>('/user', {
        method: 'POST',
        body: JSON.stringify(user),
      });
      this.user = response.data;
    } catch (error) {
      this.user = null;
      throw error;
    }
  }

  public async updateUser(user: ArgosUser): Promise<void> {
    try {
      const response = await this.fetchApi<ArgosUser>(`/user/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(user),
      });
      this.user = response.data;
    } catch (error) {
      throw error;
    }
  }

  public async deleteUser(): Promise<void> {
    if (!this.user) return;

    try {
      await this.fetchApi(`/user/${this.user.id}`, {
        method: 'DELETE',
      });
      this.user = null;
    } catch (error) {
      throw error;
    }
  }
}
