import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import {
  ArgosProvider,
  useArgosSDK,
  useArgosPresence,
} from '../../context/ArgosContext';
import { ArgosSDK } from '../../ArgosSDK';
import {
  PresenceData,
  EventHandler,
  PresenceTracker,
} from '../../PresenceTracker';
import { jest } from '@jest/globals';
import { ApiResponse, FingerprintData } from '../../types/api';
import { FingerprintAPI } from '../../api/FingerprintAPI';

describe('ArgosContext', () => {
  let mockSDK: Partial<ArgosSDK>;
  let presenceCallback: (data: PresenceData) => void;

  beforeEach(() => {
    presenceCallback = jest.fn();

    const mockPresence = {
      interval: 30000,
      retryAttempts: 3,
      retryDelay: 5000,
      isTracking: false,
      retryCount: 0,
      timeoutId: undefined,
      on: jest.fn().mockImplementation((event, handler) => {
        if (event === 'presence') {
          presenceCallback = handler as EventHandler<PresenceData>;
        }
        return mockPresence;
      }),
      off: jest.fn().mockReturnThis(),
      start: jest.fn().mockReturnThis(),
      stop: jest.fn().mockReturnThis(),
      isActive: jest.fn().mockReturnValue(false),
      emit: jest.fn(),
      addListener: jest.fn().mockReturnThis(),
      removeListener: jest.fn().mockReturnThis(),
      removeAllListeners: jest.fn().mockReturnThis(),
      setMaxListeners: jest.fn().mockReturnThis(),
      getMaxListeners: jest.fn().mockReturnValue(10),
      listeners: jest.fn().mockReturnValue([]),
      rawListeners: jest.fn().mockReturnValue([]),
      listenerCount: jest.fn().mockReturnValue(0),
      prependListener: jest.fn().mockReturnThis(),
      prependOnceListener: jest.fn().mockReturnThis(),
      eventNames: jest.fn().mockReturnValue([]),
    } as unknown as PresenceTracker;

    const mockFingerprint = {
      createFingerprint: jest
        .fn<() => Promise<ApiResponse<FingerprintData>>>()
        .mockResolvedValue({
          success: true,
          data: {
            id: 'test',
            userAgent: 'test',
            ip: 'test',
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      getFingerprint: jest
        .fn<() => Promise<ApiResponse<FingerprintData>>>()
        .mockResolvedValue({
          success: true,
          data: {
            id: 'test',
            userAgent: 'test',
            ip: 'test',
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      updateFingerprint: jest
        .fn<() => Promise<ApiResponse<FingerprintData>>>()
        .mockResolvedValue({
          success: true,
          data: {
            id: 'test',
            userAgent: 'test',
            ip: 'test',
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      deleteFingerprint: jest
        .fn<() => Promise<ApiResponse<FingerprintData>>>()
        .mockResolvedValue({
          success: true,
          data: {
            id: 'test',
            userAgent: 'test',
            ip: 'test',
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      fetchApi: jest.fn(),
      baseUrl: 'test',
      apiKey: 'test',
    } as unknown as FingerprintAPI;

    mockSDK = {
      presence: mockPresence,
      fingerprint: mockFingerprint,
      isOnline: jest.fn<() => boolean>().mockReturnValue(true),
    };
  });

  it('initializes presence tracking on mount', () => {
    render(
      <ArgosProvider sdk={mockSDK as ArgosSDK}>
        <div>Test</div>
      </ArgosProvider>
    );

    expect(mockSDK.presence?.start).toHaveBeenCalled();
    expect(mockSDK.presence?.on).toHaveBeenCalledWith(
      'presence',
      expect.any(Function)
    );
  });

  it('provides SDK through useArgosSDK hook', () => {
    const { result } = renderHook(() => useArgosSDK(), {
      wrapper: ({ children }) => (
        <ArgosProvider sdk={mockSDK as ArgosSDK}>{children}</ArgosProvider>
      ),
    });

    expect(result.current).toBe(mockSDK);
  });

  it('updates presence state when presence event occurs', async () => {
    const { result } = renderHook(() => useArgosPresence(), {
      wrapper: ({ children }) => (
        <ArgosProvider sdk={mockSDK as ArgosSDK}>{children}</ArgosProvider>
      ),
    });

    const mockPresenceData: PresenceData = {
      timestamp: new Date().toISOString(),
      status: 'online',
    };

    await act(async () => {
      presenceCallback(mockPresenceData);
    });

    expect(result.current).toEqual({
      presence: mockPresenceData,
      isOnline: true,
    });
  });
});
