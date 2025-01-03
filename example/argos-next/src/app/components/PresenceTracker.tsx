'use client';

import { useFingerprint, usePresence } from '@project89/argos-sdk/client/react';
import { useEffect, useState } from 'react';

export function PresenceTracker() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <PresenceTrackerContent />;
}

function PresenceTrackerContent() {
  const { fingerprint, isLoading } = useFingerprint();
  const { updatePresence } = usePresence();
  const [status, setStatus] = useState<'online' | 'offline'>('online');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    if (!fingerprint?.id || isLoading) {
      setError('Waiting for fingerprint initialization...');
      return;
    }

    const handlePresenceUpdate = async (newStatus: 'online' | 'offline') => {
      try {
        await updatePresence(
          newStatus,
          () => {
            setLastUpdate(new Date().toISOString());
            setError(null);
            setUpdateCount((prev) => prev + 1);
          },
          (err) => {
            setError(err.message);
          }
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update presence'
        );
      }
    };

    // Update presence initially
    handlePresenceUpdate(status);

    // Set up online/offline listeners
    const handleOnline = () => {
      setStatus('online');
      handlePresenceUpdate('online');
    };

    const handleOffline = () => {
      setStatus('offline');
      handlePresenceUpdate('offline');
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      const newStatus = document.hidden ? 'offline' : 'online';
      setStatus(newStatus);
      handlePresenceUpdate(newStatus);
    };

    // Handle window focus/blur
    const handleFocus = () => {
      setStatus('online');
      handlePresenceUpdate('online');
    };

    const handleBlur = () => {
      setStatus('offline');
      handlePresenceUpdate('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Set up periodic updates
    const interval = setInterval(() => {
      handlePresenceUpdate(status);
    }, 30000); // Update every 30 seconds

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      clearInterval(interval);
    };
  }, [fingerprint?.id, isLoading, status, updatePresence]);

  return (
    <div className="border p-4 rounded bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Presence Tracking</h3>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span
            className={`font-medium ${
              status === 'online' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {status === 'online' ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <span>Status Updates:</span>
          <span className="font-mono">{updateCount}</span>
        </div>
        {lastUpdate && (
          <div className="flex justify-between items-center">
            <span>Last Update:</span>
            <span className="font-mono">
              {new Date(lastUpdate).toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span>Fingerprint ID:</span>
          <span
            className="font-mono truncate ml-2 max-w-[200px]"
            title={fingerprint?.id || 'Not ready'}
          >
            {fingerprint?.id || 'Not ready'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Network Status:</span>
          <span
            className={`font-medium ${
              navigator.onLine ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {navigator.onLine ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
}
