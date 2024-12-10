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
- 🛡️ TypeScript Support
- ⚡ Lightweight and Performant

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
import { ArgosTracker } from '@project89/argos-sdk';

// Initialize the tracker
const tracker = new ArgosTracker({
  baseUrl: 'YOUR_API_ENDPOINT',
  apiKey: 'YOUR_API_KEY'
});

// Create a fingerprint
const fingerprint = await tracker.fingerprint.createFingerprint({
  userAgent: navigator.userAgent,
  ip: '127.0.0.1',
  metadata: {
    language: navigator.language,
    platform: navigator.platform
  }
});

// Track a visit
await tracker.visit.createVisit({
  fingerprintId: fingerprint.data.id,
  url: window.location.href,
  timestamp: new Date().toISOString()
});

// Manage user roles
await tracker.role.addRoles(fingerprint.data.id, ['user']);
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

The SDK can be configured with various options:

```typescript
interface BaseAPIConfig {
  baseUrl: string;  // API endpoint
  apiKey: string;   // Your API key
}
```

## Error Handling

All API methods return a Promise with an `ApiResponse` type that includes success status and error information:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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