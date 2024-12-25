import { useCallback, useState } from 'react';
import { useFingerprint } from './useFingerprint';
import { useArgosSDK } from './useArgosSDK';
import type {
  ImpressionData,
  GetImpressionsOptions,
  CreateImpressionRequest,
} from '../types/api';

interface UseImpressionsReturn {
  impressions: ImpressionData[];
  isLoading: boolean;
  error: Error | null;
  createImpression: (type: string, data: Record<string, any>) => Promise<void>;
  getImpressions: (options?: GetImpressionsOptions) => Promise<void>;
  deleteImpressions: (options?: GetImpressionsOptions) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useImpressions(): UseImpressionsReturn {
  const { fingerprint } = useFingerprint();
  const sdk = useArgosSDK();
  const [impressions, setImpressions] = useState<ImpressionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createImpression = useCallback(
    async (type: string, data: Record<string, any>) => {
      if (!fingerprint?.id) {
        throw new Error('Fingerprint ID is required');
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await sdk.createImpression({
          fingerprintId: fingerprint.id,
          type,
          data,
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
    [fingerprint?.id, sdk]
  );

  const getImpressions = useCallback(
    async (options?: GetImpressionsOptions) => {
      if (!fingerprint?.id) {
        throw new Error('Fingerprint ID is required');
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await sdk.getImpressions(fingerprint.id, options);
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
    [fingerprint?.id, sdk]
  );

  const deleteImpressions = useCallback(
    async (options?: GetImpressionsOptions) => {
      if (!fingerprint?.id) {
        throw new Error('Fingerprint ID is required');
      }

      setIsLoading(true);
      setError(null);

      try {
        await sdk.deleteImpressions(fingerprint.id, options);
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
    [fingerprint?.id, sdk, getImpressions]
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
