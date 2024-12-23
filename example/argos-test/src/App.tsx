import { useCallback, useEffect, useState } from 'react';
import {
  ArgosProvider,
  useArgosSDK,
  useFingerprint,
  useOnlineStatus,
} from '../../../src';
import * as fpjs from '@fingerprintjs/fingerprintjs';

// Function to get browser fingerprint
async function getBrowserFingerprint() {
  try {
    // Initialize an agent at application startup.
    const fpAgent = await fpjs.load();

    // Get the visitor identifier when you need it.
    const result = await fpAgent.get();

    // Use the visitor identifier as a stable identifier of the browser.
    return result.visitorId;
  } catch (err) {
    console.error('Error getting browser fingerprint:', err);
    // Fallback to UUID if fingerprinting fails
    return crypto.randomUUID();
  }
}

// Component to display fingerprint information
function FingerprintInfo() {
  const { fingerprintId, fingerprint, isLoading, error } = useFingerprint();
  const isOnline = useOnlineStatus();
  const sdk = useArgosSDK();
  const [registrationError, setRegistrationError] = useState<Error | null>(
    null
  );

  const handleRegisterFingerprint = async () => {
    try {
      setRegistrationError(null);
      console.log('Starting fingerprint registration...');

      const result = await sdk.identify({
        fingerprint: await getBrowserFingerprint(),
        metadata: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timestamp: new Date().toISOString(),
        },
      });

      console.log('Registration result:', result);
    } catch (err) {
      console.error('Registration error:', err);
      setRegistrationError(
        err instanceof Error ? err : new Error('Failed to register fingerprint')
      );
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error.message}</p>
        <button onClick={handleRegisterFingerprint} className="register-button">
          Retry Registration
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="loading">Loading fingerprint data...</div>;
  }

  return (
    <div className="fingerprint-container">
      <h3>Fingerprint Information</h3>
      <div
        className="status-badge"
        data-status={isOnline ? 'online' : 'offline'}
      >
        {isOnline ? 'Online' : 'Offline'}
      </div>
      {fingerprintId ? (
        <>
          <p>
            <strong>ID:</strong> {fingerprintId}
          </p>
          {fingerprint && (
            <>
              <p>
                <strong>Created:</strong>{' '}
                {(() => {
                  try {
                    if (!fingerprint.createdAt) return 'Unknown';

                    // Handle Firestore timestamp
                    if (
                      typeof fingerprint.createdAt === 'object' &&
                      '_seconds' in fingerprint.createdAt
                    ) {
                      const timestamp = fingerprint.createdAt as {
                        _seconds: number;
                        _nanoseconds: number;
                      };
                      const milliseconds =
                        timestamp._seconds * 1000 +
                        Math.floor(timestamp._nanoseconds / 1000000);
                      return new Date(milliseconds).toLocaleString();
                    }

                    // Try parsing as ISO string
                    const date = new Date(fingerprint.createdAt);
                    if (!isNaN(date.getTime())) {
                      return date.toLocaleString();
                    }

                    // Try parsing as number
                    const numDate = new Date(Number(fingerprint.createdAt));
                    if (!isNaN(numDate.getTime())) {
                      return numDate.toLocaleString();
                    }

                    return 'Invalid Date';
                  } catch (err) {
                    console.error('Date parsing error:', err);
                    return 'Invalid Date';
                  }
                })()}
              </p>
              <p>
                <strong>Roles:</strong>{' '}
                {fingerprint.roles?.join(', ') || 'No roles'}
              </p>
              <details>
                <summary>Metadata</summary>
                <pre>{JSON.stringify(fingerprint.metadata, null, 2)}</pre>
              </details>
            </>
          )}
        </>
      ) : (
        <div>
          <p>No fingerprint registered</p>
          <button
            onClick={handleRegisterFingerprint}
            className="register-button"
          >
            Register Fingerprint
          </button>
          {registrationError && (
            <p className="error-text">{registrationError.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Component to display system status
function SystemStatus() {
  const sdk = useArgosSDK();
  const [health, setHealth] = useState<{
    status: string;
    version: string;
  } | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await sdk.checkHealth();
        if (response.success && response.data) {
          setHealth({
            status: response.data.status,
            version: response.data.version,
          });
        }
      } catch (error) {
        console.error('Failed to check health:', error);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [sdk]);

  return (
    <div className="system-status">
      <h3>System Status</h3>
      {health ? (
        <>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`status-${health.status}`}>{health.status}</span>
          </p>
          <p>
            <strong>Version:</strong> {health.version}
          </p>
        </>
      ) : (
        <p>Loading system status...</p>
      )}
    </div>
  );
}

// Component to edit fingerprint metadata
function MetadataEditor() {
  const { fingerprintId, fingerprint } = useFingerprint();
  const sdk = useArgosSDK();
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [updateError, setUpdateError] = useState<Error | null>(null);

  const handleUpdateMetadata = async () => {
    if (!fingerprintId || !key.trim()) return;

    try {
      setUpdateError(null);
      const updatedMetadata = {
        ...fingerprint?.metadata,
        [key.trim()]: value.trim(),
      };

      await sdk.updateFingerprint(fingerprintId, {
        metadata: updatedMetadata,
      });

      // Clear form after successful update
      setKey('');
      setValue('');
    } catch (err) {
      console.error('Metadata update error:', err);
      setUpdateError(
        err instanceof Error ? err : new Error('Failed to update metadata')
      );
    }
  };

  if (!fingerprintId) {
    return null;
  }

  return (
    <div className="metadata-editor">
      <h3>Update Metadata</h3>
      <div className="form-group">
        <input
          type="text"
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input-field"
        />
        <button
          onClick={handleUpdateMetadata}
          disabled={!key.trim()}
          className="update-button"
        >
          Add/Update
        </button>
      </div>
      {updateError && <p className="error-text">{updateError.message}</p>}
    </div>
  );
}

// Main App component
function App() {
  const handleError = useCallback((error: Error) => {
    console.error('Argos Error:', error);
  }, []);

  return (
    <ArgosProvider
      config={{
        baseUrl: 'http://127.0.0.1:5001/argos-434718/us-central1/api',
        debug: true,
      }}
      onError={handleError}
      debug={true}
    >
      <div className="app-container">
        <header>
          <h1>Argos SDK Demo</h1>
        </header>

        <main>
          <div className="grid">
            <div>
              <FingerprintInfo />
              <MetadataEditor />
            </div>
            <SystemStatus />
          </div>
        </main>

        <style>{`
          .app-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            color: #1a1a1a;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
          }

          .fingerprint-container,
          .system-status {
            background: #ffffff;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            color: #1a1a1a;
          }

          h1, h2, h3 {
            color: #1a1a1a;
            margin-bottom: 1rem;
          }

          .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 1rem;
          }

          .status-badge[data-status="online"] {
            background: #22c55e;
            color: white;
          }

          .status-badge[data-status="offline"] {
            background: #ef4444;
            color: white;
          }

          .status-ok {
            color: #22c55e;
          }

          .status-error {
            color: #ef4444;
          }

          .error-container {
            background: #fee2e2;
            border: 1px solid #ef4444;
            border-radius: 8px;
            padding: 1rem;
            color: #b91c1c;
          }

          .loading {
            color: #6b7280;
            font-style: italic;
          }

          details {
            margin-top: 1rem;
          }

          summary {
            cursor: pointer;
            color: #4b5563;
            font-weight: 500;
          }

          pre {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            color: #1a1a1a;
          }

          strong {
            color: #4a5568;
            font-weight: 600;
          }

          p {
            margin: 0.5rem 0;
            color: #1a1a1a;
          }

          .register-button {
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            margin-top: 1rem;
          }

          .register-button:hover {
            background: #2563eb;
          }

          .error-text {
            color: #ef4444;
            margin-top: 0.5rem;
            font-size: 0.875rem;
          }

          .metadata-editor {
            background: #ffffff;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-top: 2rem;
          }

          .form-group {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
          }

          .input-field {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            font-size: 0.875rem;
          }

          .update-button {
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
          }

          .update-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
          }

          .update-button:hover:not(:disabled) {
            background: #2563eb;
          }
        `}</style>
      </div>
    </ArgosProvider>
  );
}

export default App;
