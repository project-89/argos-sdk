import { jest } from '@jest/globals';
import { ArgosTracker } from '../ArgosTracker';
import { ArgosUser, UserRole } from '../types/api';
import {
  createMockFetch,
  mockFetchResponse,
  mockFetchErrorResponse,
} from './utils/testUtils';

describe('ArgosTracker', () => {
  let tracker: ArgosTracker;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = createMockFetch();
    global.fetch = mockFetch;
    tracker = new ArgosTracker({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('User Management', () => {
    const mockUser: ArgosUser = {
      id: 'test-id',
      fingerprintId: 'test-fingerprint',
      roles: ['user' as UserRole],
      tags: {
        experience: 0,
        missions_completed: 0,
        first_visit: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should initialize without a user', () => {
      expect(tracker.getUser()).toBeNull();
    });

    it('should set and get user', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse(mockUser));

      await tracker.setUser(mockUser);
      expect(tracker.getUser()).toEqual(mockUser);
    });

    it('should handle user update', async () => {
      const updatedUser = { ...mockUser, roles: ['premium' as UserRole] };
      mockFetch.mockResolvedValueOnce(mockFetchResponse(updatedUser));

      await tracker.updateUser(updatedUser);
      expect(tracker.getUser()).toEqual(updatedUser);
    });

    it('should handle user deletion', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse(undefined));

      await tracker.deleteUser();
      expect(tracker.getUser()).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchErrorResponse('API Error'));
      await expect(tracker.setUser({} as ArgosUser)).rejects.toThrow(
        'API Error'
      );
    });
  });
});
