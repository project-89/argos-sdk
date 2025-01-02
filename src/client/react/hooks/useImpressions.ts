import { useCallback } from 'react';
import { useArgosSDK } from './useArgosSDK';
import { useFingerprint } from './useFingerprint';
import type {
  ImpressionData,
  ApiResponse,
  GetImpressionsOptions,
} from '../../../shared/interfaces/api';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

interface UseImpressionsResult {
  createImpression: (
    type: string,
    metadata?: Record<string, unknown>,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  getImpressions: (
    options?: GetImpressionsOptions
  ) => Promise<ApiResponse<ImpressionData[]>>;
  deleteImpressions: (type?: string) => Promise<void>;
}

export function useImpressions(): UseImpressionsResult {
  const sdk = useArgosSDK();
  const { fingerprintId } = useFingerprint();

  const createImpression = useCallback(
    async (
      type: string,
      metadata: Record<string, unknown> = {},
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
          await sdk.createImpression({
            type,
            fingerprintId,
            data: metadata,
          });
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

  const getImpressions = useCallback(
    async (options?: GetImpressionsOptions) => {
      if (!fingerprintId) {
        throw new Error('No fingerprint ID available');
      }
      return sdk.getImpressions(fingerprintId, options);
    },
    [sdk, fingerprintId]
  );

  const deleteImpressions = useCallback(
    async (type?: string) => {
      if (!fingerprintId) {
        throw new Error('No fingerprint ID available');
      }
      await sdk.deleteImpressions(fingerprintId, type);
    },
    [sdk, fingerprintId]
  );

  return {
    createImpression,
    getImpressions,
    deleteImpressions,
  };
}
