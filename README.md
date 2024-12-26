# Argos SDK

The Argos SDK is a versatile tracking and analytics library designed to be environment-agnostic, providing seamless functionality in both browser and server environments. It offers a unified API for tracking visits, presence, impressions, and custom events.

## Features

- 🌐 Environment-agnostic architecture
- 🔄 Unified API across all environments
- 🔒 Secure fingerprint-based identification
- 📊 Real-time analytics and tracking
- 🔑 Robust API key management
- 🌍 Environment-specific optimizations
- ⚛️ React hooks and components (browser only)
- 🚀 Full TypeScript support

## Installation

```bash
npm install @project89/argos-sdk
```

## Quick Start

### Environment-Agnostic Usage

```typescript
import { ArgosSDK } from '@project89/argos-sdk';

// The SDK automatically detects the environment and uses appropriate implementations
const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  debug: true // Enable for detailed logging
});

// Create or retrieve a fingerprint
const fingerprint = await sdk.identify({
  fingerprint: 'unique-identifier',
  metadata: { source: 'web-app' }
});

// Create an impression
await sdk.createImpression({
  fingerprintId: fingerprint.data.id,
  type: 'page-view',
  data: {
    url: typeof window !== 'undefined' ? window.location.href : 'server-side',
    timestamp: Date.now()
  }
});
```

### Browser-Specific Features

```typescript
import { ArgosSDK } from '@project89/argos-sdk';
import { ImpressionManager } from '@project89/argos-sdk/react';

// Browser-optimized initialization
const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  environment: 'browser' // Explicitly set environment if needed
});

// React component with automatic impression tracking
function App() {
  return (
    <ImpressionManager
      sdk={sdk}
      onError={(error) => console.error(error)}
    >
      {/* Your app content */}
    </ImpressionManager>
  );
}
```

### Server-Specific Features

```typescript
import { ArgosServerSDK } from '@project89/argos-sdk/server';

// Server-optimized initialization
const serverSdk = new ArgosServerSDK({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key',
  environment: 'server' // Explicitly set environment if needed
});

// Server-side fingerprint management
const fingerprint = await serverSdk.identify({
  fingerprint: 'server-generated-id',
  metadata: { source: 'api-server' }
});

// API key management
const apiKey = await serverSdk.registerApiKey(fingerprint.data.id, {
  metadata: { purpose: 'client-auth' }
});
```

### Next.js Integration

```typescript
// pages/api/track.ts
import { ArgosServerSDK } from '@project89/argos-sdk/server';

export default async function handler(req, res) {
  const serverSdk = new ArgosServerSDK({
    baseUrl: process.env.ARGOS_API_URL,
    apiKey: process.env.ARGOS_API_KEY
  });

  try {
    // Handle both server-side tracking and API key management
    switch (req.body.action) {
      case 'track':
        const result = await serverSdk.createImpression(req.body.data);
        res.status(200).json(result);
        break;
      case 'register':
        const apiKey = await serverSdk.registerApiKey(req.body.fingerprintId);
        res.status(200).json(apiKey);
        break;
      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## Configuration

### Common SDK Options

```typescript
interface SDKOptions {
  baseUrl: string;
  debug?: boolean;
  storage?: StorageInterface;
  environment?: RuntimeEnvironment | EnvironmentInterface;
}
```

### Server SDK Additional Options

```typescript
interface ServerSDKOptions extends SDKOptions {
  apiKey: string;
}
```

## Environment Interface

The SDK uses an environment interface to handle environment-specific functionality:

```typescript
interface EnvironmentInterface {
  type: RuntimeEnvironment;
  createHeaders(headers?: Record<string, string>): Record<string, string>;
  handleResponse<T>(response: Response): Promise<ApiResponse<T>>;
  getFingerprint(): Promise<string>;
  // ... other environment-specific methods
}
```

## Storage Interface

Storage is also environment-agnostic:

```typescript
interface StorageInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed information about contributing to the SDK.

## License

MIT License - see [LICENSE](LICENSE) for details.