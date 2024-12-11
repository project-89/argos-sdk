import { PUBLIC_ENDPOINTS, isPublicEndpoint } from '../../constants/endpoints';

describe('Endpoints Constants', () => {
  describe('PUBLIC_ENDPOINTS', () => {
    it('should contain the expected public endpoints', () => {
      expect(PUBLIC_ENDPOINTS).toContainEqual({
        path: '/fingerprint',
        methods: ['POST'],
      });
      expect(PUBLIC_ENDPOINTS).toContainEqual({
        path: '/roles',
        methods: ['GET'],
      });
      expect(PUBLIC_ENDPOINTS).toContainEqual({
        path: '/api-key/validate',
        methods: ['POST'],
      });
      expect(PUBLIC_ENDPOINTS).toContainEqual({
        path: '/visit',
        methods: ['POST'],
      });
      expect(PUBLIC_ENDPOINTS).toContainEqual({
        path: '/presence',
        methods: ['POST'],
      });
    });

    it('should include the fingerprint ID pattern', () => {
      const regexPattern = PUBLIC_ENDPOINTS.find(
        (config) => config.path instanceof RegExp
      );
      expect(regexPattern).toBeDefined();
      expect(regexPattern?.path).toBeInstanceOf(RegExp);
      expect((regexPattern?.path as RegExp).source).toBe(
        '^\\/fingerprint\\/[^/]+$'
      );
      expect(regexPattern?.methods).toEqual(['GET']);
    });
  });

  describe('isPublicEndpoint', () => {
    it('should return true for public endpoints with correct method', () => {
      expect(isPublicEndpoint('/fingerprint', 'POST')).toBe(true);
      expect(isPublicEndpoint('/fingerprint/123', 'GET')).toBe(true);
      expect(isPublicEndpoint('/roles', 'GET')).toBe(true);
      expect(isPublicEndpoint('/api-key/validate', 'POST')).toBe(true);
      expect(isPublicEndpoint('/visit', 'POST')).toBe(true);
      expect(isPublicEndpoint('/presence', 'POST')).toBe(true);
    });

    it('should return false for public endpoints with wrong method', () => {
      expect(isPublicEndpoint('/fingerprint', 'GET')).toBe(false);
      expect(isPublicEndpoint('/fingerprint/123', 'POST')).toBe(false);
      expect(isPublicEndpoint('/roles', 'POST')).toBe(false);
      expect(isPublicEndpoint('/api-key/validate', 'GET')).toBe(false);
      expect(isPublicEndpoint('/visit', 'GET')).toBe(false);
      expect(isPublicEndpoint('/presence', 'GET')).toBe(false);
    });

    it('should return false for non-public endpoints', () => {
      expect(isPublicEndpoint('/api-key', 'GET')).toBe(false);
      expect(isPublicEndpoint('/api-key', 'POST')).toBe(false);
      expect(isPublicEndpoint('/api-key/123', 'GET')).toBe(false);
      expect(isPublicEndpoint('/api-key/123', 'PUT')).toBe(false);
      expect(isPublicEndpoint('/api-key/123', 'DELETE')).toBe(false);
    });
  });
});
