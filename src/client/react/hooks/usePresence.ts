import { useCallback } from 'react';
import { useArgosSDK } from './useArgosSDK';
import { useFingerprint } from './useFingerprint';
import type { ApiResponse, PresenceData } from '../../../shared/interfaces/api';

interface UsePresenceResult {
  updatePresence: (
    status: 'online' | 'offline',
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

export function usePresence(): UsePresenceResult {
  const sdk = useArgosSDK();
  const { fingerprintId } = useFingerprint();

  const updatePresence = useCallback(
    async (
      status: 'online' | 'offline',
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ) => {
      if (!fingerprintId) {
        const error = new Error('No fingerprint ID available');
        onError?.(error);
        return;
      }

      let retries = 0;
      while (retries < MAX_RETRIES) {
        try {
          await sdk.updatePresence(fingerprintId, status);
          onSuccess?.();
          return;
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          if (retries === MAX_RETRIES - 1) {
            onError?.(error);
            return;
          }
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAYS[retries])
          );
          retries++;
        }
      }
    },
    [sdk, fingerprintId]
  );

  return {
    updatePresence,
  };
}
