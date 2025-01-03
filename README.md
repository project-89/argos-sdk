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
  storage?: StorageInterface; // Optional: Custom storage implementation
  environment?: RuntimeEnvironment | EnvironmentInterface; // Optional: Environment configuration
  maxRequestsPerMinute?: number; // Optional: Rate limiting (default varies by environment)
}
```

### Server SDK Additional Options

```typescript
interface ServerSDKOptions extends SDKOptions {
  apiKey: string; // Required: Server-side API key
}
```

## Request Handling

The SDK includes sophisticated request handling features for production reliability:

### Rate Limiting

- Built-in rate limiting with configurable requests per minute and hour
- Default limits:
  - Server environment: 1000 requests per hour (aligned with server fingerprint limit)
  - Browser environment: 300 requests per hour (aligned with server IP limit)
- Configurable via environment variables or SDK options:
  - `ARGOS_MAX_REQUESTS_PER_HOUR`: Maximum requests per hour (default: 1000)
  - `ARGOS_MAX_REQUESTS_PER_MINUTE`: Maximum requests per minute (default: 100)
- Automatic request queueing when rate limit is reached
- Smart retry after rate limit window expires
- Different default limits for browser and server environments
- Respects server's rate limit responses (429)