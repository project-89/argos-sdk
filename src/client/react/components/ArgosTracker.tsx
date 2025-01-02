import { useEffect, useCallback } from 'react';
import { useImpressions } from '../hooks/useImpressions';
import { useArgosSDK } from '../hooks/useArgosSDK';

export interface ArgosTrackerProps {
  /**
   * The unique identifier for the impression
   */
  id: string;
  /**
   * The type of impression to track
   */
  type: string;
  /**
   * Optional metadata to attach to the impression
   */
  metadata?: Record<string, unknown>;
  /**
   * Optional callback when the impression is tracked
   */
  onTrack?: () => void;
  /**
   * Optional callback when there's an error tracking the impression
   */
  onError?: (error: Error) => void;
  /**
   * If true, will track automatically on mount
   * @default true
   */
  trackOnMount?: boolean;
  /**
   * If true, will track whenever metadata changes
   * @default false
   */
  trackOnUpdate?: boolean;
}

export function ArgosTracker({
  id,
  type,
  metadata = {},
  onTrack,
  onError,
  trackOnMount = true,
  trackOnUpdate = false,
}: ArgosTrackerProps) {
  const { createImpression } = useImpressions();
  const sdk = useArgosSDK();

  const trackImpression = useCallback(async () => {
    try {
      await createImpression(
        type,
        {
          ...metadata,
          impressionId: id,
          timestamp: new Date().toISOString(),
        },
        onTrack,
        onError
      );
    } catch (error) {
      // Error is already handled by createImpression
    }
  }, [id, type, metadata, createImpression, onTrack, onError]);

  // Track on mount if enabled
  useEffect(() => {
    if (trackOnMount) {
      trackImpression();
    }
  }, [trackOnMount, trackImpression]);

  // Track on metadata updates if enabled
  useEffect(() => {
    if (trackOnUpdate) {
      trackImpression();
    }
  }, [metadata, trackOnUpdate, trackImpression]);

  return null;
}

// Export the track function for manual tracking
export function useTrackImpression() {
  const { createImpression } = useImpressions();
  const context = useArgosSDK();

  return useCallback(
    async (type: string, data: Record<string, unknown> = {}) => {
      if (!context) return;
      return createImpression(type, data);
    },
    [context, createImpression]
  );
}
