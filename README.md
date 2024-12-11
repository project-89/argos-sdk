# Argos SDK

The Argos SDK provides fingerprinting and tracking capabilities for web applications.

## Installation

```bash
npm install @project89/argos-sdk
```

## Basic Usage

```typescript
import { ArgosSDK } from '@project89/argos-sdk';

const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key', // Optional - only needed for protected endpoints
  debug: true // Optional - enables debug logging
});

// Identify a user
const response = await sdk.identify({
  userAgent: navigator.userAgent,
  ip: '', // Will be set by server
  metadata: {
    language: navigator.language,
    platform: navigator.platform
  }
});

// Track a visit
await sdk.track('visit', {
  fingerprintId: response.data.id,
  url: window.location.href
});

// Track presence
await sdk.track('presence', {
  fingerprintId: response.data.id,
  currentPage: window.location.pathname
});
```

## React Integration

### Provider Setup

```tsx
import { ArgosProvider } from '@project89/argos-sdk';

function App() {
  return (
    <ArgosProvider config={{ baseUrl: 'https://api.example.com' }}>
      <YourApp />
    </ArgosProvider>
  );
}
```

### Using the SDK in Components

```tsx
import { useArgosSDK, useArgosPresence } from '@project89/argos-sdk';

function YourComponent() {
  const sdk = useArgosSDK();
  const { isOnline } = useArgosPresence();

  useEffect(() => {
    // Example: Track custom event
    sdk.track('visit', {
      fingerprintId: 'user-fingerprint-id',
      url: window.location.href
    });
  }, [sdk]);

  return (
    <div>
      Connection Status: {isOnline ? 'Online' : 'Offline'}
    </div>
  );
}
```

## API Reference

### Core SDK Methods

#### `identify(request: CreateFingerprintRequest): Promise<ApiResponse<FingerprintData>>`
Creates or retrieves a fingerprint for the current user.

#### `track(event: ArgosEventType, data: VisitData | PresenceData): Promise<ApiResponse<void>>`
Tracks user events (visit or presence).

#### `isOnline(): boolean`
Checks if the client is currently online.

### Protected API Methods (Require API Key)

#### `validateAPIKey(apiKey: string): Promise<ApiResponse<boolean>>`
Validates an API key.

#### `getRoles(fingerprintId: string): Promise<ApiResponse<RoleData>>`
Gets roles for a fingerprint.

#### `addRoles(fingerprintId: string, roles: string[]): Promise<ApiResponse<RoleData>>`
Adds roles to a fingerprint.

#### `removeRoles(fingerprintId: string, roles: string[]): Promise<ApiResponse<RoleData>>`
Removes roles from a fingerprint.

### React Hooks

#### `useArgosSDK()`
Provides access to the SDK instance within React components.

#### `useArgosPresence()`
Provides real-time presence information.

### Types

```typescript
interface ArgosSDKConfig {
  baseUrl: string;
  apiKey?: string;
  debug?: boolean;
}

interface CreateFingerprintRequest {
  userAgent: string;
  ip: string;
  metadata: Record<string, any>;
}

interface FingerprintData {
  id: string;
  userAgent: string;
  ip: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface VisitData {
  fingerprintId: string;
  url: string;
  timestamp?: string;
}

interface PresenceData {
  fingerprintId: string;
  currentPage: string;
  timestamp?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

## Error Handling

```typescript
try {
  const response = await sdk.identify({
    userAgent: navigator.userAgent,
    ip: '',
    metadata: {}
  });
} catch (error) {
  console.error('Failed to identify user:', error);
}
```

## Rate Limiting

The SDK automatically handles rate limiting by throwing an error with retry information when limits are exceeded:

```typescript
try {
  await sdk.track('visit', visitData);
} catch (error) {
  if (error.message.includes('Rate limit exceeded')) {
    // Handle rate limiting
    const retryAfter = parseInt(error.message.match(/\d+/)[0], 10);
    console.log(`Retry after ${retryAfter} seconds`);
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

## License

MIT