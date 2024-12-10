# 🔍 Argos SDK

A powerful SDK for tracking and managing user interactions, fingerprinting, and role-based access in web applications. Built with TypeScript.

## Features

- 👤 User Fingerprinting & Identity Management
- 🎯 Visit Tracking & Analytics
- 👥 Role-Based Access Control
- 💰 Price Tracking
- 🔍 Debug Information
- 🔑 API Key Management
- 🌡️ Reality Stability Monitoring
- 🛡️ Full TypeScript Support with Bundled Type Declarations
- ⚡ Lightweight and Performant
- 🔄 Automatic Queue Management for Offline Support
- 📝 Comprehensive Logging System

## Installation

```bash
npm install @project89/argos-sdk
# or
yarn add @project89/argos-sdk
# or
pnpm add @project89/argos-sdk
```

## Quick Start

```typescript
import { ArgosSDK } from '@project89/argos-sdk';

// Initialize the SDK with TypeScript type checking
const sdk = new ArgosSDK({
  baseUrl: 'YOUR_API_ENDPOINT',
  apiKey: 'YOUR_API_KEY',
  // Optional configuration
  cache: {
    enabled: true,
    ttl: 3600
  },
  queue: {
    retryLimit: 3,
    retryDelay: 1000
  },
  log: {
    level: 'info',
    enabled: true
  }
});

// TypeScript example with full type inference
interface CustomMetadata {
  language: string;
  platform: string;
  customField?: string;
}

// Create a fingerprint with type-safe metadata
const fingerprint = await sdk.fingerprint.createFingerprint({
  userAgent: navigator.userAgent,
  ip: '127.0.0.1',
  metadata: {
    language: navigator.language,
    platform: navigator.platform
  } as CustomMetadata
});

// Track a visit with type checking
await sdk.visit.createVisit({
  fingerprintId: fingerprint.data.id,
  url: window.location.href,
  timestamp: new Date().toISOString()
});

// Manage user roles with type safety
await sdk.role.addRoles(fingerprint.data.id, ['user']);

// Check online status
const isOnline: boolean = sdk.isOnline();

// Get queue size for pending operations
const queueSize: number = sdk.getQueueSize();
```

## API Reference

The SDK provides several APIs for different functionalities:

### FingerprintAPI
- `createFingerprint(request)`: Create a new fingerprint
- `getFingerprint(id)`: Get fingerprint by ID
- `updateFingerprint(id, request)`: Update fingerprint
- `deleteFingerprint(id)`: Delete fingerprint

### VisitAPI
- `createVisit(visit)`: Record a new visit
- `getVisits()`: Get all visits

### RoleAPI
- `addRoles(fingerprintId, roles)`: Add roles to a fingerprint
- `getRoles(fingerprintId)`: Get roles for a fingerprint
- `removeRoles(fingerprintId, roles)`: Remove roles from a fingerprint

### PriceAPI
- `getCurrentPrice()`: Get current price
- `getPriceHistory(startDate?, endDate?)`: Get price history

### RealityStabilityAPI
- `getCurrentStability()`: Get current reality stability metrics

### APIKeyAPI
- `createAPIKey(request)`: Create a new API key
- `getAPIKey(id)`: Get API key by ID
- `listAPIKeys()`: List all API keys
- `updateAPIKey(id, request)`: Update API key
- `deleteAPIKey(id)`: Delete API key

### DebugAPI
- `getDebugInfo()`: Get debug information

## Configuration

The SDK supports comprehensive configuration options:

```typescript
interface ArgosSDKConfig {
  // Required configuration
  baseUrl: string;  // API endpoint
  apiKey: string;   // Your API key

  // Optional cache configuration
  cache?: {
    enabled?: boolean;  // Enable/disable caching
    ttl?: number;       // Cache TTL in seconds
  };

  // Optional queue configuration
  queue?: {
    retryLimit?: number;  // Number of retry attempts
    retryDelay?: number;  // Delay between retries in ms
  };

  // Optional logging configuration
  log?: {
    level?: 'debug' | 'info' | 'warn' | 'error';
    enabled?: boolean;
  };
}
```

## Type Support

The package includes built-in TypeScript declarations. No additional `@types` package is required. All types are automatically available when importing from `@project89/argos-sdk`.

## Error Handling

All API methods return a Promise with a fully typed `ApiResponse`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Example with type inference
const response = await sdk.fingerprint.getFingerprint(id);
if (response.success) {
  const fingerprint = response.data; // Fully typed fingerprint data
} else {
  console.error(response.error);
}
```

## Development

To contribute to the development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure:
```bash
ARGOS_API_URL=https://api.argos.project89.io
DEBUG=false
HEARTBEAT_INTERVAL=30000
```
4. Run tests: `npm test`
5. Build: `npm run build`

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Project89](LICENSE)