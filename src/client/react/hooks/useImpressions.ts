import { useCallback } from 'react';
import { useArgosSDK } from './useArgosSDK';
import { useFingerprint } from './useFingerprint';
import type { GetImpressionsOptions } from '../../../shared/interfaces/api';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s delays

export function useImpressions() {
  const sdk = useArgosSDK();
  const { fingerprintId } = useFingerprint();

  const createImpression = useCallback(
    async (
      type: string,
      data: Record<string, unknown> = {},
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ) => {
      if (!fingerprintId) {
        const error = new Error('No fingerprint ID available');
        onError?.(error);
        return;
      }

      let attempt = 0;
      while (attempt <= MAX_RETRIES) {
        try {
          const response = await sdk.createImpression({
            fingerprintId,
            type,
            data,
          });

          if (response.success) {
            onSuccess?.();
            return response;
          }

          throw new Error(response.error || 'Failed to create impression');
        } catch (error) {
          if (attempt === MAX_RETRIES) {
            onError?.(
              error instanceof Error ? error : new Error(String(error))
            );
            throw error;
          }

          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAYS[attempt])
          );
          attempt++;
        }
      }
    },
    [sdk, fingerprintId]
  );

  const getImpressions = useCallback(
    async (options?: GetImpressionsOptions) => {
      if (!fingerprintId) {
        throw new Error('No fingerprint ID available');
      }

      let attempt = 0;
      while (attempt <= MAX_RETRIES) {
        try {
          const response = await sdk.getImpressions(fingerprintId, options);

          if (response.success) {
            return response;
          }

          throw new Error(response.error || 'Failed to get impressions');
        } catch (error) {
          if (attempt === MAX_RETRIES) {
            throw error;
          }

          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAYS[attempt])
          );
          attempt++;
        }
      }
    },
    [sdk, fingerprintId]
  );

  return { createImpression, getImpressions };
}
