# Argos SDK

The Argos SDK is a versatile tracking and analytics library designed to be environment-agnostic, providing seamless functionality in both browser and server environments. It offers a unified API for tracking visits, presence, impressions, and custom events with built-in rate limiting and error handling.

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

### Environment-Agnostic Usage

```typescript
import { ArgosSDK } from '@project89/argos-sdk';

// Initialize the SDK - it automatically detects the environment
const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  debug: true, // Enable for detailed logging
  maxRequestsPerMinute: 60 // Optional rate limiting
});

// Create or retrieve a fingerprint
const fingerprint = await sdk.identify({
  fingerprint: 'unique-identifier', // Optional - will be auto-generated if not provided
  metadata: { source: 'web-app' }
});

// Track an impression
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
  environment: 'browser', // Explicitly set environment if needed
  maxRequestsPerMinute: 60 // Recommended for browser environments
});

// React component with automatic impression tracking
function App() {
  return (
    <ImpressionManager
      sdk={sdk}
      onError={(error) => console.error('Impression tracking error:', error)}
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
  environment: 'server', // Explicitly set environment if needed
  maxRequestsPerMinute: 120 // Higher limit for server environments
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
  // Initialize SDK with environment variables
  const serverSdk = new ArgosServerSDK({
    baseUrl: process.env.ARGOS_API_URL,
    apiKey: process.env.ARGOS_API_KEY,
    maxRequestsPerMinute: 120 // Adjust based on your needs
  });

  try {
    // Handle both server-side tracking and API key management
    switch (req.body.action) {
      case 'track':
        const result = await serverSdk.createImpression(req.body.data);
        res.status(200).json(result);
        break;
      case 'register':
        const apiKey = await serverSdk.registerApiKey(req.body.fingerprintId, {
          metadata: req.body.metadata // Optional metadata
        });
        res.status(200).json(apiKey);
        break;
      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Argos SDK Error:', error);
    res.status(500).json({ error: error.message });
  }
}
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

Example with environment variables:
```env
# .env
ARGOS_MAX_REQUESTS_PER_HOUR=1000
ARGOS_MAX_REQUESTS_PER_MINUTE=100
```

Example with SDK configuration:

```typescript
// Server environment (higher limits)
const serverSdk = new ArgosServerSDK({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key',
  maxRequestsPerHour: 1000,    // Overrides ARGOS_MAX_REQUESTS_PER_HOUR
  maxRequestsPerMinute: 100,   // Overrides ARGOS_MAX_REQUESTS_PER_MINUTE
  debug: process.env.NODE_ENV !== 'production'
});

// Browser environment (lower limits)
const browserSdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  maxRequestsPerHour: 300,     // IP-based limit
  maxRequestsPerMinute: 30,    // Distributed across the hour
  debug: process.env.NODE_ENV !== 'production'
});
```

Configuration precedence:
1. SDK configuration options (`maxRequestsPerHour`, `maxRequestsPerMinute`)
2. Environment variables (`ARGOS_MAX_REQUESTS_PER_HOUR`, `ARGOS_MAX_REQUESTS_PER_MINUTE`)
3. Default values (1000/hour, 100/minute)

Example with custom rate limiting:

```typescript
// Server environment (higher limits)
const serverSdk = new ArgosServerSDK({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key',
  maxRequestsPerHour: 1000,    // Fingerprint-based limit
  maxRequestsPerMinute: 100,   // Distributed across the hour
  debug: process.env.NODE_ENV !== 'production'
});

// Browser environment (lower limits)
const browserSdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  maxRequestsPerHour: 300,     // IP-based limit
  maxRequestsPerMinute: 30,    // Distributed across the hour
  debug: process.env.NODE_ENV !== 'production'
});
```

### Retry Behavior

- Automatic retry for network errors and server errors (5xx)
- Exponential backoff strategy for retries
- Respects server's `retry-after` header for rate limit (429) responses
- Configurable maximum retry attempts
- Smart error handling with type-safe error responses

Example with rate limiting:

```typescript
const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  maxRequestsPerMinute: 60, // Adjust based on your environment
  debug: process.env.NODE_ENV !== 'production' // Recommended debug setting
});
```

## Environment Interface

The SDK uses an environment interface to handle environment-specific functionality:

```typescript
interface EnvironmentInterface {
  type: RuntimeEnvironment;
  createHeaders(headers?: Record<string, string>): Record<string, string>;
  handleResponse<T>(response: Response): Promise<ApiResponse<T>>;
  getFingerprint(): Promise<string>;
  setApiKey(key: string): void;
  getApiKey(): string | undefined;
  isOnline(): boolean;
  getPlatformInfo(): Promise<Record<string, unknown>>;
  getUserAgent(): string;
}
```

## Storage Interface

Storage is environment-agnostic and can be customized:

```typescript
interface StorageInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

## Error Handling

The SDK provides consistent error handling across environments:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed information about:
- Contributing to the SDK
- Setting up the development environment
- Running tests
- Building for production

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

For issues and feature requests, please use our [GitHub Issues](https://github.com/project89/argos-sdk/issues) page.

## API Key Management

The SDK provides comprehensive API key management with automatic refresh and rotation capabilities:

### Key Lifecycle

```typescript
// Create a new API key
const apiKey = await sdk.createAPIKey({
  name: 'my-key',
  fingerprintId: 'your-fingerprint-id',
  metadata: { purpose: 'client-auth' }
});

// Validate an API key
const validation = await sdk.validateAPIKey(apiKey.data.key);
if (validation.data.needsRefresh) {
  // Key needs refresh
}

// Manually refresh a key
const refreshed = await sdk.refreshAPIKey(apiKey.data.key);

// Rotate a key (creates new key and invalidates old)
const rotated = await sdk.rotateAPIKey(apiKey.data.key);

// Revoke a key
await sdk.revokeAPIKey({ key: apiKey.data.key });
```

### Automatic Key Management

The SDK includes automatic key refresh capabilities:

```typescript
const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  refreshThreshold: 24 * 60 * 60 * 1000, // 24 hours
  autoRefresh: true // Enable auto-refresh
});

// Key will automatically refresh when nearing expiration
await sdk.validateAPIKey(key);
```

### Key Security Best Practices

1. **Storage**
   - Never store API keys in client-side storage (localStorage/sessionStorage)
   - Use secure server-side storage for API keys
   - Implement proper key rotation policies

2. **Refresh Strategy**
   - Set appropriate refresh thresholds based on your needs
   - Enable auto-refresh for seamless key management
   - Handle refresh failures gracefully

3. **Key Rotation**
   - Rotate keys regularly for enhanced security
   - Implement proper transition periods during rotation
   - Clean up old keys after rotation