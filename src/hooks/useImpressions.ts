import { useCallback, useState } from 'react';
import { useFingerprint } from './useFingerprint';
import { useArgosSDK } from './useArgosSDK';
import type { ImpressionData, GetImpressionsOptions } from '../types/api';

interface UseImpressionsReturn {
  impressions: ImpressionData[];
  isLoading: boolean;
  error: Error | null;
  createImpression: (
    type: string,
    data: Record<string, unknown>,
    options?: { source?: string; sessionId?: string }
  ) => Promise<void>;
  getImpressions: (options?: GetImpressionsOptions) => Promise<void>;
  deleteImpressions: (options?: GetImpressionsOptions) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useImpressions(): UseImpressionsReturn {
  const { fingerprintId } = useFingerprint();
  const sdk = useArgosSDK();
  const [impressions, setImpressions] = useState<ImpressionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createImpression = useCallback(
    async (
      type: string,
      data: Record<string, unknown>,
      options?: { source?: string; sessionId?: string }
    ) => {
      if (!fingerprintId) {
        throw new Error('Fingerprint ID is required');
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await sdk.createImpression({
          fingerprintId,
          type,
          data,
          source: options?.source,
          sessionId: options?.sessionId,
        });

        if (response.success && response.data) {
          setImpressions(
            (prev) => [response.data, ...prev] as ImpressionData[]
          );
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [fingerprintId, sdk]
  );

  const getImpressions = useCallback(
    async (options?: GetImpressionsOptions) => {
      if (!fingerprintId) {
        throw new Error('Fingerprint ID is required');
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await sdk.getImpressions(fingerprintId, options);
        if (response.success && response.data) {
          setImpressions(response.data);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [fingerprintId, sdk]
  );

  const deleteImpressions = useCallback(
    async (options?: GetImpressionsOptions) => {
      if (!fingerprintId) {
        throw new Error('Fingerprint ID is required');
      }

      setIsLoading(true);
      setError(null);

      try {
        await sdk.deleteImpressions(fingerprintId, options);
        // Refresh the impressions list after deletion
        await getImpressions(options);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [fingerprintId, sdk, getImpressions]
  );

  const refresh = useCallback(async () => {
    await getImpressions();
  }, [getImpressions]);

  return {
    impressions,
    isLoading,
    error,
    createImpression,
    getImpressions,
    deleteImpressions,
    refresh,
  };
}
