/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  useImpressions,
  useFingerprint,
  useArgosSDK,
} from '@project89/argos-sdk/client/react';
import { useEffect, useState, useCallback } from 'react';

// Define the ImpressionData type to match the SDK's type
interface ImpressionData {
  id: string;
  type: string;
  data: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export function ImpressionManager() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <ImpressionManagerContent />;
}

function formatTimestamp(data: Record<string, any>): string {
  try {
    // Check different possible timestamp locations
    const timestamp = data.timestamp || data.createdAt || data.updatedAt;
    if (!timestamp) return 'No timestamp';

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid date';

    return date.toLocaleTimeString();
  } catch (err) {
    return 'Invalid date';
  }
}

function ImpressionManagerContent() {
  const { fingerprint, isLoading: isFingerprintLoading } = useFingerprint();
  const sdk = useArgosSDK();
  const { createImpression } = useImpressions();
  const [clientImpressions, setClientImpressions] = useState<ImpressionData[]>(
    []
  );
  const [serverImpressions, setServerImpressions] = useState<ImpressionData[]>(
    []
  );
  const [isClientLoading, setIsClientLoading] = useState(false);
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServerImpressions = useCallback(async () => {
    if (!fingerprint?.id || !sdk.getApiKey()) return;

    setIsServerLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/impressions?fingerprintId=${fingerprint.id}`,
        {
          headers: {
            'x-api-key': sdk.getApiKey() || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load server impressions');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setServerImpressions(result.data);
      }
    } catch (err) {
      console.error('Failed to load server impressions:', err);
      setError('Failed to load server impressions');
    } finally {
      setIsServerLoading(false);
    }
  }, [fingerprint?.id, sdk]);

  // Load server impressions initially when fingerprint and SDK are ready
  useEffect(() => {
    if (fingerprint?.id && sdk.getApiKey() && !isFingerprintLoading) {
      loadServerImpressions();
    }
  }, [fingerprint?.id, sdk, isFingerprintLoading, loadServerImpressions]);

  const handleClientImpression = async () => {
    if (!fingerprint?.id || !sdk.getApiKey()) {
      setError('Please wait for initialization to complete');
      return;
    }

    setIsClientLoading(true);
    setError(null);
    try {
      const timestamp = new Date().toISOString();
      await createImpression(
        'client-button-click',
        {
          timestamp,
          source: 'client',
          fingerprintId: fingerprint.id,
        },
        () => {
          // On success, add the impression to the local state
          setClientImpressions((prev) => [
            ...prev,
            {
              id: `client-${Date.now()}`, // Generate a temporary ID
              type: 'client-button-click',
              data: {
                timestamp,
                source: 'client',
                fingerprintId: fingerprint.id,
              },
            },
          ]);
        },
        (error) => {
          console.error('Failed to create client impression:', error);
          setError('Failed to create client impression');
        }
      );
    } finally {
      setIsClientLoading(false);
    }
  };

  const handleServerImpression = async () => {
    if (!fingerprint?.id || !sdk.getApiKey()) {
      setError('Please wait for initialization to complete');
      return;
    }

    setIsServerLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/impressions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': sdk.getApiKey() || '',
        },
        body: JSON.stringify({
          type: 'server-button-click',
          fingerprintId: fingerprint.id,
          data: {
            timestamp: new Date().toISOString(),
            source: 'server',
            fingerprintId: fingerprint.id,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create server impression');
      }

      await loadServerImpressions();
    } catch (err) {
      console.error('Failed to create server impression:', err);
      setError('Failed to create server impression');
    } finally {
      setIsServerLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Impression Tracking</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-medium">Client-Side Impressions</h4>
            <button
              onClick={handleClientImpression}
              disabled={isClientLoading || !fingerprint?.id || !sdk.getApiKey()}
              className={`px-4 py-2 rounded ${
                isClientLoading || !fingerprint?.id || !sdk.getApiKey()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isClientLoading ? 'Creating...' : 'Create Impression'}
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            {clientImpressions.length === 0 ? (
              <p className="text-gray-500">No client impressions yet</p>
            ) : (
              <ul className="space-y-2">
                {clientImpressions.map((impression) => (
                  <li
                    key={impression.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="font-mono">{impression.type}</span>
                    <span className="text-gray-500">
                      {formatTimestamp(impression.data)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-medium">Server-Side Impressions</h4>
            <button
              onClick={handleServerImpression}
              disabled={isServerLoading || !fingerprint?.id || !sdk.getApiKey()}
              className={`px-4 py-2 rounded ${
                isServerLoading || !fingerprint?.id || !sdk.getApiKey()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isServerLoading ? 'Creating...' : 'Create Impression'}
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            {serverImpressions.length === 0 ? (
              <p className="text-gray-500">No server impressions yet</p>
            ) : (
              <ul className="space-y-2">
                {serverImpressions.map((impression) => (
                  <li
                    key={impression.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="font-mono">{impression.type}</span>
                    <span className="text-gray-500">
                      {formatTimestamp(impression.data)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
