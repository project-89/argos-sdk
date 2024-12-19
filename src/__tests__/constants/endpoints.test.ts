import { isPublicEndpoint } from '../../constants/endpoints';

describe('Endpoints', () => {
  describe('isPublicEndpoint', () => {
    it('should identify public endpoints correctly', () => {
      // Fingerprint endpoints
      expect(isPublicEndpoint('/fingerprint/register', 'POST')).toBe(true);
      expect(isPublicEndpoint('/fingerprint', 'GET')).toBe(true);
      expect(isPublicEndpoint('/fingerprint/123', 'GET')).toBe(true);

      // Roles endpoints
      expect(isPublicEndpoint('/roles', 'GET')).toBe(true);

      // API Key endpoints
      expect(isPublicEndpoint('/api-key/validate', 'POST')).toBe(true);
      expect(isPublicEndpoint('/api-key/register', 'POST')).toBe(true);
    });

    it('should identify protected endpoints correctly', () => {
      // Protected fingerprint endpoints
      expect(isPublicEndpoint('/fingerprint/123', 'PUT')).toBe(false);
      expect(isPublicEndpoint('/fingerprint/123', 'DELETE')).toBe(false);

      // Protected API key endpoints
      expect(isPublicEndpoint('/api-key', 'GET')).toBe(false);
      expect(isPublicEndpoint('/api-key', 'POST')).toBe(false);
      expect(isPublicEndpoint('/api-key/123', 'PUT')).toBe(false);
      expect(isPublicEndpoint('/api-key/123', 'DELETE')).toBe(false);
    });

    it('should handle invalid methods correctly', () => {
      expect(isPublicEndpoint('/fingerprint/register', 'GET')).toBe(false);
      expect(isPublicEndpoint('/api-key/validate', 'GET')).toBe(false);
    });
  });
});
