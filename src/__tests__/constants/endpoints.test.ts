import { PUBLIC_ENDPOINTS, isPublicEndpoint } from '../../constants/endpoints';

describe('Endpoints Constants', () => {
  describe('PUBLIC_ENDPOINTS', () => {
    it('should contain the expected public endpoints', () => {
      expect(PUBLIC_ENDPOINTS).toContainEqual({
        path: '/fingerprint/register',
        methods: ['POST'],
      });

      expect(PUBLIC_ENDPOINTS).toContainEqual({
        path: /^\/fingerprint\/[^/]+$/,
        methods: ['GET'],
      });

      expect(PUBLIC_ENDPOINTS).toContainEqual({
        path: '/visit/log',
        methods: ['POST'],
      });

      expect(PUBLIC_ENDPOINTS).toContainEqual({
        path: '/visit/presence',
        methods: ['POST'],
      });

      expect(PUBLIC_ENDPOINTS).toContainEqual({
        path: '/apiKey/validate',
        methods: ['POST'],
      });
    });
  });

  describe('isPublicEndpoint', () => {
    it('should return true for public endpoints with correct method', () => {
      expect(isPublicEndpoint('/fingerprint/register', 'POST')).toBe(true);
      expect(isPublicEndpoint('/fingerprint/123', 'GET')).toBe(true);
      expect(isPublicEndpoint('/visit/log', 'POST')).toBe(true);
      expect(isPublicEndpoint('/visit/presence', 'POST')).toBe(true);
      expect(isPublicEndpoint('/apiKey/validate', 'POST')).toBe(true);
    });

    it('should return false for public endpoints with incorrect method', () => {
      expect(isPublicEndpoint('/fingerprint/register', 'GET')).toBe(false);
      expect(isPublicEndpoint('/fingerprint/123', 'POST')).toBe(false);
      expect(isPublicEndpoint('/visit/log', 'GET')).toBe(false);
    });

    it('should return false for non-public endpoints', () => {
      expect(isPublicEndpoint('/unknown', 'POST')).toBe(false);
      expect(isPublicEndpoint('/api/private', 'GET')).toBe(false);
    });
  });
});
