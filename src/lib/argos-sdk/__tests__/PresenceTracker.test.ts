import { PresenceTracker } from '../PresenceTracker';
import { ArgosError } from '../errors';
import { ArgosConfig } from '../types';

describe('PresenceTracker', () => {
  const mockConfig: Required<ArgosConfig> = {
    baseUrl: 'http://test-api.com',
    heartbeatInterval: 1000,
    debug: true,
    metadata: {},
  };

  const mockFingerprint = 'test-fingerprint';
  const mockSiteId = 'test-site';

  // Mock fetch globally
  const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should create instance with valid config', () => {
      const tracker = new PresenceTracker(
        mockFingerprint,
        mockSiteId,
        mockConfig
      );
      expect(tracker).toBeInstanceOf(PresenceTracker);
    });
  });

  describe('presence tracking', () => {
    let tracker: PresenceTracker;

    beforeEach(() => {
      tracker = new PresenceTracker(mockFingerprint, mockSiteId, mockConfig);
    });

    it('should start tracking presence', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'online' }),
      } as Response);

      await tracker.start();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/presence/heartbeat'),
        expect.any(Object)
      );
    });

    it('should handle heartbeat failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const errorPromise = new Promise<Error>((resolve) => {
        tracker.on('error', (err: Error) => {
          resolve(err);
        });
      });

      await tracker.start();
      const error = await errorPromise;

      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ArgosError);
      expect((error as ArgosError).code).toBe('HEARTBEAT_FAILED');
    }, 10000);

    it('should cleanup resources', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await tracker.start();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await tracker.cleanup();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/presence/cleanup'),
        expect.any(Object)
      );
    }, 10000); // Increase timeout for cleanup
  });

  describe('visibility change handling', () => {
    let tracker: PresenceTracker;
    let visibilityState: { hidden: boolean };
    let visibilityCallback: () => void;

    beforeEach(() => {
      visibilityState = { hidden: false };
      tracker = new PresenceTracker(mockFingerprint, mockSiteId, mockConfig);

      // Mock document.hidden
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => visibilityState.hidden,
      });

      // Mock addEventListener to capture the visibility callback
      document.addEventListener = jest.fn(
        (event: string, callback: () => void) => {
          if (event === 'visibilitychange') {
            visibilityCallback = callback;
          }
        }
      );
    });

    it('should pause heartbeat when page is hidden', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'online' }),
      } as Response);

      await tracker.start();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      visibilityState.hidden = true;
      visibilityCallback();

      // Fast-forward past heartbeat interval
      jest.advanceTimersByTime(mockConfig.heartbeatInterval);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional calls
    });

    it('should resume heartbeat when page becomes visible', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'online' }),
      } as Response);

      await tracker.start();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Hide page
      visibilityState.hidden = true;
      visibilityCallback();
      jest.advanceTimersByTime(mockConfig.heartbeatInterval);

      // Show page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'online' }),
      } as Response);

      visibilityState.hidden = false;
      visibilityCallback();

      // Should send heartbeat immediately when becoming visible
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
