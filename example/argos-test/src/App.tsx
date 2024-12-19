import { ArgosProvider, useArgosPresence, useArgosSDK } from '../../../src';

// Component to display SDK status and data
function ArgosDemo() {
  const sdk = useArgosSDK();
  const { isOnline, fingerprintId, fingerprint, isLoading, error } =
    useArgosPresence();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Argos SDK Demo</h2>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      >
        <h3>Connection Status</h3>
        <p>
          Online Status:{' '}
          <span style={{ color: isOnline ? 'green' : 'red' }}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      </div>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      >
        <h3>Fingerprint Information</h3>
        {fingerprintId ? (
          <>
            <p>Fingerprint ID: {fingerprintId}</p>
            {fingerprint && (
              <div>
                <p>
                  Created At: {new Date(fingerprint.createdAt).toLocaleString()}
                </p>
                <p>Roles: {fingerprint.roles?.join(', ') || 'No roles'}</p>
                <details>
                  <summary>Full Fingerprint Data</summary>
                  <pre>{JSON.stringify(fingerprint, null, 2)}</pre>
                </details>
              </div>
            )}
          </>
        ) : (
          <p>No fingerprint generated yet</p>
        )}
      </div>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      >
        <h3>SDK Status</h3>
        <p>API Status: {sdk.isOnline() ? 'Connected' : 'Disconnected'}</p>
        <p>Has Fingerprint: {fingerprintId ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}

function App() {
  const handleError = (error: Error) => {
    console.error('ArgosProvider Error:', error);
  };

  return (
    <ArgosProvider
      config={{
        baseUrl: 'http://localhost:5001/argos-434718/us-central1/api',
        debug: true,
      }}
      onError={handleError}
      debug={true}
    >
      <ArgosDemo />
    </ArgosProvider>
  );
}

export default App;
