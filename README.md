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

## React Integration

The SDK provides a React context and hooks for seamless integration with React applications. Here's a comprehensive guide on how to use the React features:

### Setting up the Provider

First, wrap your application with the `ArgosProvider`:

```tsx
import { ArgosSDK, ArgosProvider } from '@project89/argos-sdk';

// Initialize SDK
const sdk = new ArgosSDK({
  baseUrl: 'YOUR_API_ENDPOINT',
  apiKey: 'YOUR_API_KEY',
});

function App() {
  return (
    <ArgosProvider sdk={sdk}>
      <YourApp />
    </ArgosProvider>
  );
}
```

The `ArgosProvider` automatically handles:
- User presence tracking
- Initial fingerprint creation
- Online/offline status monitoring
- Event queueing for offline operations

### Using the Hooks

The SDK provides two main hooks for accessing functionality within your components:

#### useArgosSDK

The `useArgosSDK` hook provides access to the full SDK instance:

```tsx
import { useArgosSDK } from '@project89/argos-sdk';

function TrackingComponent() {
  const sdk = useArgosSDK();

  const handleUserAction = async () => {
    // Create a visit
    await sdk.visit.createVisit({
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    // Add user roles
    await sdk.role.addRoles('user-id', ['premium']);
  };

  return <button onClick={handleUserAction}>Track Action</button>;
}
```

#### useArgosPresence

The `useArgosPresence` hook provides presence-related information:

```tsx
import { useArgosPresence } from '@project89/argos-sdk';

function PresenceIndicator() {
  const { presence, isOnline } = useArgosPresence();

  return (
    <div>
      <div>Connection Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</div>
      <div>Last Active: {presence?.timestamp}</div>
      <div>Current Page: {presence?.currentPage}</div>
    </div>
  );
}
```

### TypeScript Support

All hooks and components are fully typed:

```tsx
import { useArgosSDK, type FingerprintData } from '@project89/argos-sdk';

function TypedComponent() {
  const sdk = useArgosSDK();

  const handleFingerprint = async () => {
    const response = await sdk.fingerprint.createFingerprint({
      userAgent: navigator.userAgent,
      ip: '',
      metadata: {
        language: navigator.language,
        platform: navigator.platform,
        // TypeScript will enforce the correct metadata shape
        customField: 'value'
      }
    });

    if (response.success) {
      const fingerprint: FingerprintData = response.data;
      // Work with the typed fingerprint data
    }
  };

  return <button onClick={handleFingerprint}>Create Fingerprint</button>;
}
```

### Best Practices

1. **Provider Placement**: Place the `ArgosProvider` as high as possible in your component tree to ensure all components have access to the SDK.

2. **Error Handling**: Always handle potential errors when making SDK calls:

```tsx
function ErrorHandlingComponent() {
  const sdk = useArgosSDK();
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      const response = await sdk.visit.createVisit({
        url: window.location.href,
        timestamp: new Date().toISOString()
      });

      if (!response.success) {
        setError(response.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError('Failed to track visit');
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleAction}>Track Visit</button>
    </div>
  );
}
```

3. **Offline Support**: The SDK automatically handles offline scenarios, but you can check the online status:

```tsx
function OfflineAwareComponent() {
  const { isOnline } = useArgosPresence();
  const sdk = useArgosSDK();

  const handleAction = async () => {
    // The SDK will automatically queue operations when offline
    await sdk.visit.createVisit({
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div>
      {!isOnline && <div>Currently offline - actions will be queued</div>}
      <button onClick={handleAction}>
        {isOnline ? 'Track Now' : 'Queue Track Action'}
      </button>
    </div>
  );
}
```

## API Authentication

The SDK supports both public and protected operations, with rate limiting applied to all endpoints:

### Public Operations (No API Key Required)
These operations can be used without an API key:
- Basic fingerprint creation and retrieval
- Listing available roles
- API key validation
- Basic tracking operations

```typescript
// Initialize SDK without API key for public operations
const sdk = new ArgosSDK({
  baseUrl: 'YOUR_API_ENDPOINT'
});

// Create a fingerprint (public operation)
const fingerprint = await sdk.fingerprint.createFingerprint({
  userAgent: navigator.userAgent,
  ip: '127.0.0.1',
  metadata: {
    language: navigator.language,
    platform: navigator.platform
  }
});

// List available roles (public operation)
const roles = await sdk.role.listAvailableRoles();
```

### Protected Operations (API Key Required)
These operations require an API key:
- Role management (except listing available roles)
- Tag management
- API key management (except validation)
- Debug operations
- Advanced fingerprint operations
- Administrative operations

```typescript
// Initialize SDK with API key for protected operations
const sdk = new ArgosSDK({
  baseUrl: 'YOUR_API_ENDPOINT',
  apiKey: 'YOUR_API_KEY'  // Required for protected operations
});

// Manage roles (protected operation)
await sdk.role.addRoles(fingerprintId, ['admin']);

// Manage tags (protected operation)
await sdk.tag.updateTags(fingerprintId, ['vip', 'beta-tester']);
```

### Rate Limiting
All operations, whether public or protected, are subject to rate limiting. The SDK will handle rate limit responses appropriately, but you should be aware of these limits when making multiple requests.

### Self-Hosted Usage
If you're self-hosting the Argos server:
1. Clone and set up the Argos server repository
2. Configure your server's base URL in the SDK
3. Generate an API key for protected operations
4. Configure rate limits as needed

### Managed Service Usage
If you're using the managed Argos service:
1. Sign up for an account (coming soon)
2. Generate an API key from the dashboard for protected operations
3. Use the provided base URL and your API key
4. Be aware of the service's rate limits