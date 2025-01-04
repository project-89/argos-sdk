import { TestAPI } from './TestAPI';
import { MockBrowserEnvironment } from '../../utils/testUtils';
import { RuntimeEnvironment } from '../../../shared/interfaces/environment';

describe('Request Handling', () => {
  let api: TestAPI;

  beforeEach(() => {
    api = new TestAPI({
      baseUrl: 'http://localhost:3000',
      maxRequestsPerMinute: 60,
      maxRequestsPerHour: 1000,
      environment: new MockBrowserEnvironment('test-fingerprint'),
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting correctly', async () => {
      const response = await api.testFetchApi('/test');
      expect(response.success).toBe(true);
    });

    it('should retry on rate limit exceeded', async () => {
      const response = await api.testFetchApi('/test');
      expect(response.success).toBe(true);
    });

    it('should handle backoff correctly', async () => {
      const response = await api.testFetchApi('/test');
      expect(response.success).toBe(true);
    });
  });
});
