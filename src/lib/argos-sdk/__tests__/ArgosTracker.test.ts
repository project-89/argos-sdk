import { ArgosTracker } from '../ArgosTracker';
import { ArgosError } from '../errors';
import { ArgosUser } from '../types';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('ArgosTracker', () => {
  const testFingerprint = 'test-fingerprint-id';
  const mockUser: ArgosUser = {
    id: 'test-user-id',
    fingerprint: testFingerprint,
    createdAt: new Date(),
  };

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('initialize', () => {
    it('should create a new instance with valid fingerprint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);

      const tracker = await ArgosTracker.initialize(testFingerprint, {
        baseUrl: 'http://test-api.com',
        debug: true,
        metadata: {},
      });
      expect(tracker).toBeInstanceOf(ArgosTracker);
      expect(tracker.getCurrentUser()).toEqual(mockUser);
    });

    it('should throw error when fingerprint is missing', async () => {
      await expect(ArgosTracker.initialize('')).rejects.toThrow(
        new ArgosError('Fingerprint ID is required', 'INVALID_FINGERPRINT')
      );

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should use default config when not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);

      await ArgosTracker.initialize(testFingerprint);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/initialize'),
        expect.any(Object)
      );
    });
  });

  describe('user management', () => {
    let tracker: ArgosTracker;

    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);

      tracker = await ArgosTracker.initialize(testFingerprint, {
        baseUrl: 'http://test-api.com',
        debug: true,
        metadata: {},
      });
      mockFetch.mockClear();
    });

    it('should return cached user without API call', async () => {
      const user = await tracker.getUser();
      expect(user).toEqual(mockUser);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should force refresh user from API', async () => {
      const updatedUser = { ...mockUser, id: 'updated-id' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedUser),
      } as Response);

      const user = await tracker.getUser(true);
      expect(user).toEqual(updatedUser);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should return current user from memory', () => {
      const user = tracker.getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const error = await tracker.getUser(true).catch((e) => e);
      expect(error).toBeInstanceOf(ArgosError);
      expect(error.code).toBe('REQUEST_FAILED');
    });
  });

  describe('presence tracking', () => {
    let tracker: ArgosTracker;

    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);

      tracker = await ArgosTracker.initialize(testFingerprint, {
        baseUrl: 'http://test-api.com',
        debug: true,
        metadata: {},
      });
    });

    it('should start tracking presence', async () => {
      const mockSiteId = 'test-site-id';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'online' }),
      } as Response);

      await tracker.trackPresence(mockSiteId);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/presence/heartbeat'),
        expect.any(Object)
      );
    });

    it('should cleanup resources', async () => {
      const mockSiteId = 'test-site-id';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await tracker.trackPresence(mockSiteId);
      tracker.cleanup();
    });
  });
});
