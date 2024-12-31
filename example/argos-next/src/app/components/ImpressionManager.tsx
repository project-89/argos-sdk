/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useImpressions, useFingerprint } from '@project89/argos-sdk';
import { useEffect, useState, useCallback } from 'react';

// Define the ImpressionData type to match the SDK's type
interface ImpressionData {
  id: string;
  type: string;
  data: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

const getApiKey = () => {
  try {
    const value = document.cookie
      .split('; ')
      .find((row) => row.startsWith('argos_api_key='))
      ?.split('=')[1];
    return value ? decodeURIComponent(value) : null;
  } catch (e: any) {
    console.error('Failed to get API key:', e);
    return null;
  }
};

export function ImpressionManager() {
  const { createImpression, getImpressions } = useImpressions();
  const { fingerprint, isLoading: isFingerprintLoading } = useFingerprint();
  const [serverImpressions, setServerImpressions] = useState<ImpressionData[]>(
    []
  );
  const [clientImpressions, setClientImpressions] = useState<ImpressionData[]>(
    []
  );
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [isClientLoading, setIsClientLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Get API key once when fingerprint is ready
  useEffect(() => {
    if (fingerprint?.id && !apiKey) {
      const key = getApiKey();
      if (key) {
        setApiKey(key);
      }
    }
  }, [fingerprint?.id, apiKey]);

  const loadServerImpressions = useCallback(async () => {
    if (!fingerprint?.id) return;

    setIsServerLoading(true);
    setError(null);
    try {
      const response = await getImpressions();
      if (response?.success && response.data) {
        setServerImpressions(response.data);
      }
    } catch (error) {
      console.error('Failed to load server impressions:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load server impressions'
      );
    } finally {
      setIsServerLoading(false);
    }
  }, [fingerprint?.id, getImpressions]);

  // Load server impressions initially when fingerprint and API key are ready
  useEffect(() => {
    if (fingerprint?.id && apiKey) {
      loadServerImpressions();
    }
  }, [fingerprint?.id, apiKey, loadServerImpressions]);

  const handleClientImpression = async () => {
    if (!fingerprint?.id) {
      setError('Please wait for fingerprint to be ready');
      return;
    }

    setIsClientLoading(true);
    setError(null);
    try {
      const response = await createImpression('client-button-click', {
        timestamp: new Date().toISOString(),
        source: 'client',
      });

      if (response?.success && response.data) {
        setClientImpressions((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Failed to create client impression:', error);
      setError('Failed to create client impression');
    } finally {
      setIsClientLoading(false);
    }
  };

  const handleServerImpression = async () => {
    if (!fingerprint?.id) {
      setError('Please wait for fingerprint to be ready');
      return;
    }

    if (!apiKey) {
      setError('Please wait for API key to be ready');
      return;
    }

    setError(null);
    try {
      const response = await fetch('/api/impressions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          fingerprintId: fingerprint.id,
          type: 'server-button-click',
          data: {
            timestamp: new Date().toISOString(),
            source: 'server',
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create server impression');
      }

      // Load the updated impressions after creating a new one
      await loadServerImpressions();
    } catch (error) {
      console.error('Failed to create server impression:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to create server impression'
      );

      // If we get an unauthorized error, try to get a fresh API key
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        const newKey = getApiKey();
        if (newKey && newKey !== apiKey) {
          setApiKey(newKey);
        }
      }
    }
  };

  const renderImpressionList = (impressionList: ImpressionData[]) => (
    <ul className="space-y-2">
      {impressionList.map((impression) => (
        <li key={impression.id} className="border-b pb-2">
          <div>Type: {impression.type}</div>
          <div>Source: {impression.data.source}</div>
          <div>Time: {impression.data.timestamp}</div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Impression Manager</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isFingerprintLoading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Initializing fingerprint...
        </div>
      )}

      {!apiKey && fingerprint?.id && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Waiting for API key...
        </div>
      )}

      <div className="mb-4">
        <div>Fingerprint ID: {fingerprint?.id || 'Not ready'}</div>
        <div>API Key: {apiKey ? 'Available' : 'Not available'}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h3 className="text-xl font-semibold mb-2">
            Client-side Impressions
          </h3>
          <button
            onClick={handleClientImpression}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
            disabled={
              isClientLoading || isFingerprintLoading || !fingerprint?.id
            }
          >
            Create Client Impression
          </button>
          {isClientLoading ? (
            <p>Loading...</p>
          ) : (
            renderImpressionList(clientImpressions)
          )}
        </div>

        <div className="border p-4 rounded">
          <h3 className="text-xl font-semibold mb-2">
            Server-side Impressions
          </h3>
          <button
            onClick={handleServerImpression}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
            disabled={
              isServerLoading || isFingerprintLoading || !fingerprint?.id
            }
          >
            Create Server Impression
          </button>
          {isServerLoading ? (
            <p>Loading...</p>
          ) : (
            renderImpressionList(serverImpressions)
          )}
        </div>
      </div>
    </div>
  );
}
