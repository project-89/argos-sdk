import {
  EnvironmentInterface,
  RuntimeEnvironment,
} from '../../../../shared/interfaces/environment';

export class TestEnvironment implements EnvironmentInterface<Response> {
  readonly type = RuntimeEnvironment.Test;
  private apiKey?: string;

  createHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      ...headers,
      'user-agent': this.getUserAgent(),
      'content-type': 'application/json',
    };
  }

  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    const data = await response.json();
    const rateLimitInfo = {
      limit:
        response.headers.get('x-ratelimit-limit') ||
        response.headers.get('X-RateLimit-Limit'),
      remaining:
        response.headers.get('x-ratelimit-remaining') ||
        response.headers.get('X-RateLimit-Remaining'),
      reset:
        response.headers.get('x-ratelimit-reset') ||
        response.headers.get('X-RateLimit-Reset'),
    };

    const hasRateLimitHeaders = Object.values(rateLimitInfo).some(
      (value) => value !== null
    );
    return {
      ...data.data,
      ...(hasRateLimitHeaders ? { rateLimitInfo } : {}),
    } as T;
  }

  async getFingerprint(): Promise<string> {
    return 'test-fingerprint';
  }

  async getPlatformInfo(): Promise<Record<string, unknown>> {
    return {
      platform: 'test',
      runtime: RuntimeEnvironment.Test,
    };
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  getApiKey(): string | undefined {
    return this.apiKey;
  }

  isOnline(): boolean {
    return true;
  }

  async fetch(url: string, options?: RequestInit): Promise<Response> {
    if (options?.body && typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
      if (!options.headers) {
        options.headers = {};
      }
      (options.headers as Record<string, string>)['content-type'] =
        'application/json';
    }
    return fetch(url, options);
  }

  getUserAgent(): string {
    return 'test-fingerprint';
  }
}
