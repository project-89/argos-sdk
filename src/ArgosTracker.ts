import { BaseAPI, BaseAPIConfig } from './api/BaseAPI';
import { ArgosUser } from './types/api';

export class ArgosTracker extends BaseAPI {
  private user: ArgosUser | null = null;

  constructor(config: BaseAPIConfig) {
    super(config);
  }

  public getUser(): ArgosUser | null {
    return this.user;
  }

  public async setUser(user: ArgosUser): Promise<void> {
    const response = await this.fetchApi<ArgosUser>('/user', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    this.user = response.data;
  }

  public async updateUser(user: ArgosUser): Promise<void> {
    const response = await this.fetchApi<ArgosUser>(`/user/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
    this.user = response.data;
  }

  public async deleteUser(): Promise<void> {
    if (!this.user) return;

    await this.fetchApi(`/user/${this.user.id}`, {
      method: 'DELETE',
    });
    this.user = null;
  }
}
