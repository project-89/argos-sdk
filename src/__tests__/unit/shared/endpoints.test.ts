import { isPublicEndpoint } from '../../../shared/constants/endpoints';
import { HttpMethod } from '../../../shared/interfaces/http';

describe('Endpoints', () => {
  describe('isPublicEndpoint', () => {
    it('should identify public endpoints correctly', () => {
      // Fingerprint endpoints
      expect(isPublicEndpoint('/fingerprint/register', HttpMethod.POST)).toBe(
        true
      );
      expect(isPublicEndpoint('/fingerprint', HttpMethod.GET)).toBe(true);
      expect(isPublicEndpoint('/fingerprint/123', HttpMethod.GET)).toBe(true);

      // Roles endpoints
      expect(isPublicEndpoint('/roles', HttpMethod.GET)).toBe(true);

      // API Key endpoints
      expect(isPublicEndpoint('/api-key/validate', HttpMethod.POST)).toBe(true);
      expect(isPublicEndpoint('/api-key/register', HttpMethod.POST)).toBe(true);
    });

    it('should identify protected endpoints correctly', () => {
      // Protected fingerprint endpoints
      expect(isPublicEndpoint('/fingerprint/123', HttpMethod.PUT)).toBe(false);
      expect(isPublicEndpoint('/fingerprint/123', HttpMethod.DELETE)).toBe(
        false
      );

      // Protected API key endpoints
      expect(isPublicEndpoint('/api-key', HttpMethod.GET)).toBe(false);
      expect(isPublicEndpoint('/api-key', HttpMethod.POST)).toBe(false);
      expect(isPublicEndpoint('/api-key/123', HttpMethod.PUT)).toBe(false);
      expect(isPublicEndpoint('/api-key/123', HttpMethod.DELETE)).toBe(false);
    });

    it('should handle invalid methods correctly', () => {
      expect(isPublicEndpoint('/fingerprint/register', HttpMethod.GET)).toBe(
        false
      );
      expect(isPublicEndpoint('/api-key/validate', HttpMethod.GET)).toBe(false);
    });
  });
});
