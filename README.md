# Argos SDK

The Argos SDK is a versatile tracking and analytics library designed to be environment-agnostic, providing seamless functionality in both browser and server environments. It offers a unified API for tracking impressions and presence, with built-in rate limiting and error handling.

## Features

- 🌐 Environment-agnostic architecture
- 🔄 Unified API across all environments
- 🔒 Secure fingerprint-based identification
- 📊 Real-time analytics and tracking
- 🔑 Robust API key management
- 🌍 Environment-specific optimizations
- ⚛️ React hooks and components (browser only)
- 🚀 Full TypeScript support
- 🔄 Built-in rate limiting and request queueing
- 🔁 Automatic retry with exponential backoff
- 🛡️ Smart error handling and recovery

## Installation

```bash
npm install @project89/argos-sdk
```

## Quick Start

### Client-Side Usage

```typescript
import { ArgosClientSDK } from '@project89/argos-sdk/client';

// Initialize the client SDK
const sdk = new ArgosClientSDK({
  baseUrl: 'https://api.example.com',
  debug: true, // Enable for detailed logging
  maxRequestsPerMinute: 60, // Optional rate limiting
  keyManagement: {
    autoRefresh: true, // Enable automatic key refresh
    refreshEndpoint: '/api/refresh-key'
  }
});

// Create or retrieve a fingerprint
const fingerprint = await sdk.identify({
  metadata: { source: 'web-app' }
});

// Track an impression
await sdk.track('page-view', {
  fingerprintId: fingerprint.data.id,
  url: window.location.href,
  title: document.title,
  metadata: { source: 'web-app' }
});

// Update presence (browser-only)
await sdk.updatePresence(fingerprint.data.id, 'online');
```

### React Integration

```typescript
import { ArgosProvider, useImpressions } from '@project89/argos-sdk/client/react';

// Wrap your app with the provider
function App() {
  return (
    <ArgosProvider
      config={{
        baseUrl: 'https://api.example.com',
        keyManagement: {
          autoRefresh: true,
          refreshEndpoint: '/api/refresh-key'
        }
      }}
      onError={(error) => console.error('SDK error:', error)}
    >
      <TrackingComponent />
    </ArgosProvider>
  );
}

// Use the useImpressions hook for tracking
function TrackingComponent() {
  const { createImpression } = useImpressions();
  
  const handleClick = async () => {
    await createImpression('button-click', {
      timestamp: new Date().toISOString(),
      source: 'user-interaction'
    });
  };

  return <button onClick={handleClick}>Track Click</button>;
}
```

### Server-Side Usage

```typescript
import { ArgosServerSDK } from '@project89/argos-sdk/server';

// Initialize the server SDK
const serverSdk = new ArgosServerSDK({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key',
  maxRequestsPerMinute: 120, // Higher limit for server environments
  encryptionKey: process.env.ENCRYPTION_KEY // For secure storage
});

// Track an impression
await serverSdk.track('api-call', {
  fingerprintId: 'server-fingerprint',
  url: '/api/data',
  title: 'API Call',
  metadata: {
    endpoint: '/api/data',
    method: 'GET'
  }
});
```

## Tracking Features

### Impression Tracking

The SDK provides methods for tracking impressions in both client and server environments:

```typescript
interface TrackOptions {
  fingerprintId: string;
  url?: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

await sdk.track('event-type', options);
```

### Presence Tracking (Browser-Only)

The SDK provides presence tracking functionality exclusively in browser environments:

```typescript
// Update presence status
await clientSdk.updatePresence(fingerprintId, 'online');

// Status can be 'online' or 'offline'
await clientSdk.updatePresence(fingerprintId, 'offline');
```

### React Integration

The React integration provides hooks and components for impression tracking:

```typescript
// Using the useImpressions hook
const { createImpression, getImpressions } = useImpressions();

// Automatic tracking with ArgosTracker
<ArgosTracker
  id="unique-id"
  type="component-view"
  metadata={{ source: 'component' }}
  trackOnMount={true}
  trackOnUpdate={false}
/>
```

## Configuration

### Common SDK Options

```typescript
interface SDKOptions {
  baseUrl: string; // Required: API endpoint
  debug?: boolean; // Optional: Enable debug logging
  storage?: StorageInterface; // Optional: Custom storage implementation (defaults to CookieStorage for client, SecureStorage for server)
  environment?: RuntimeEnvironment | EnvironmentInterface; // Optional: Environment configuration
  maxRequestsPerMinute?: number; // Optional: Rate limiting (default varies by environment)
}
```

### Server SDK Additional Options

```typescript
interface ServerSDKOptions extends SDKOptions {
  apiKey: string; // Required: Server-side API key
  encryptionKey?: string; // Required if using default SecureStorage
  storagePath?: string; // Optional: Custom path for SecureStorage
}
```

## Request Handling

The SDK includes sophisticated request handling features for production reliability:

### Rate Limiting

- Built-in rate limiting with configurable requests per minute and hour
- Default limits must be explicitly set via environment variables or SDK options:
  - `ARGOS_MAX_REQUESTS_PER_HOUR`
  - `ARGOS_MAX_REQUESTS_PER_MINUTE`
- Recommended defaults:
  - Server environment: 1000 requests per hour
  - Browser environment: 300 requests per hour
- Rate limit handling:
  - When limits are exceeded, requests will be rejected with an error
  - Your application should implement appropriate retry logic or queueing if needed
  - The SDK respects server's rate limit responses (429)

### Error Handling and Logging

The SDK includes built-in error handling and logging capabilities:

- Debug logging can be enabled for development but should be disabled in production
- Sensitive data (like full API keys) is never logged
- Error messages are sanitized to prevent data leakage
- Custom error handlers can be provided for specific error scenarios

```typescript
const sdk = new ArgosClientSDK({
  baseUrl: 'https://api.example.com',
  debug: process.env.NODE_ENV === 'development', // Enable only in development
  onError: (error) => {
    // Custom error handling
    console.error('SDK error:', error.message);
  }
});
```

## Storage Mechanisms

### Client-Side Storage (CookieStorage)

The client SDK uses `CookieStorage` by default for storing data, including API keys and fingerprints. While cookies provide some advantages over localStorage, please note the following security considerations:

- Cookies are still vulnerable to XSS attacks unless set as `HttpOnly`
- For maximum security, consider storing API keys server-side or using `HttpOnly` cookies
- If using client-side storage, ensure your application has proper XSS protections in place

```typescript
// CookieStorage is used by default in the client SDK
const sdk = new ArgosClientSDK({
  baseUrl: 'https://api.example.com'
});

// Configure cookie options for better security
const sdk = new ArgosClientSDK({
  baseUrl: 'https://api.example.com',
  storage: new CookieStorage({
    secure: true, // Requires HTTPS
    sameSite: 'strict',
    path: '/',
    domain: 'your-domain.com'
  })
});
```

### Server-Side Storage (SecureStorage)

The server SDK uses `SecureStorage` by default for secure, encrypted storage of sensitive data. Important security considerations:

- The `encryptionKey` is required when using `SecureStorage`
- Never commit encryption keys to version control
- Use environment variables or a secure secrets management system
- Ensure proper access controls for the storage file location

```typescript
// SecureStorage with proper key management
const sdk = new ArgosServerSDK({
  baseUrl: 'https://api.example.com',
  apiKey: process.env.ARGOS_API_KEY,
  encryptionKey: process.env.ARGOS_ENCRYPTION_KEY // Required for SecureStorage
});
```

## Security Best Practices

1. API Key Management
   - Store API keys securely using environment variables
   - Use different keys for development and production
   - Rotate keys regularly and revoke compromised keys immediately
   - Consider using short-lived keys with automatic refresh

2. Storage Security
   - Use `HttpOnly` cookies when possible for client-side storage
   - Implement proper XSS protections in your application
   - Use encryption for server-side storage
   - Regularly audit stored data and clean up unused keys

3. Rate Limiting
   - Set appropriate rate limits for your use case
   - Implement proper retry logic for rate limit errors
   - Monitor rate limit usage in production

4. Error Handling
   - Never log sensitive data
   - Implement proper error handling for all SDK operations
   - Monitor errors in production for security incidents