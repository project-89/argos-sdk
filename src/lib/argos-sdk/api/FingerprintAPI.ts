import { Fingerprint } from '../types/Fingerprint';
import { ApiResponse } from '../types/api';

export class FingerprintAPI {
  constructor(private baseUrl: string) {}

  async register(
    fingerprint: string,
    metadata?: Record<string, any>
  ): Promise<Fingerprint> {
    const response = await fetch(`${this.baseUrl}/fingerprint/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fingerprint, metadata }),
    });

    const data: ApiResponse<Fingerprint> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Registration failed');
    }

    return data.data;
  }

  async get(id: string): Promise<Fingerprint> {
    const response = await fetch(`${this.baseUrl}/fingerprint/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: ApiResponse<Fingerprint> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get fingerprint');
    }

    return data.data;
  }
}
