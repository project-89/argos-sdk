# Argos SDK

The Argos SDK provides fingerprinting, presence tracking, and visit analytics for web applications.

## Installation

```bash
npm install @project89/argos-sdk
```

## Basic Usage

```typescript
import { ArgosSDK } from '@project89/argos-sdk';

const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  debug: true // Optional - enables debug logging
});

// Create a fingerprint
const response = await sdk.createFingerprint({
  fingerprint: 'generated-fingerprint-hash',
  metadata: {
    language: navigator.language,
    platform: navigator.platform
  }
});

// Log a visit
await sdk.createVisit({
  fingerprintId: response.data.id,
  url: window.location.href,
  title: document.title
});

// Update presence
await sdk.updatePresence({
  fingerprintId: response.data.id,
  status: 'active'
});
```

## React Integration

### Provider Setup

```tsx
import { ArgosProvider } from '@project89/argos-sdk';

function App() {
  return (
    <ArgosProvider config={{ 
      baseUrl: 'https://api.example.com',
      debug: true // Optional - enables debug logging
    }}>
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
    // Example: Log a visit
    sdk.createVisit({
      fingerprintId: 'user-fingerprint-id',
      url: window.location.href,
      title: document.title
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

#### `createFingerprint(request: CreateFingerprintRequest): Promise<ApiResponse<FingerprintData>>`
Creates a new fingerprint for the current user.

#### `createVisit(request: CreateVisitRequest): Promise<ApiResponse<VisitData>>`
Logs a visit for the given fingerprint.

#### `updatePresence(request: UpdatePresenceRequest): Promise<ApiResponse<PresenceData>>`
Updates presence status for a fingerprint.

#### `getVisitHistory(fingerprintId: string, options?: { limit?: number, offset?: number, startDate?: string, endDate?: string }): Promise<ApiResponse<{ visits: VisitData[] }>>`
Retrieves visit history for a fingerprint.

### React Hooks

#### `useArgosSDK()`
Provides access to the SDK instance within React components. This is the primary hook for all SDK functionality.

#### `useArgosPresence()`
Provides real-time presence tracking and online status information.

### Types

```typescript
interface ArgosSDKConfig {
  baseUrl: string;
  debug?: boolean;
}

interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface IpMetadata {
  ipFrequency: Record<string, number>;
  lastSeenAt: Record<string, FirestoreTimestamp>;
  primaryIp: string;
  suspiciousIps: string[];
}

interface CreateFingerprintRequest {
  fingerprint: string;
  metadata?: Record<string, any>;
}

interface Fingerprint {
  id: string;
  fingerprint: string;
  roles: string[];
  createdAt: FirestoreTimestamp;
  metadata: Record<string, any>;
  ipAddresses: string[];
  ipMetadata: IpMetadata;
  tags: string[];
}

interface CreateVisitRequest {
  fingerprintId: string;
  url: string;
  title?: string;
  metadata?: Record<string, any>;
}

interface VisitData {
  id: string;
  fingerprintId: string;
  url: string;
  title: string;
  timestamp: string;
  site: {
    domain: string;
    visitCount: number;
  };
}

interface UpdatePresenceRequest {
  fingerprintId: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
}

interface PresenceData {
  success: boolean;
  timestamp: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Error Handling

```typescript
try {
  const response = await sdk.createFingerprint({
    fingerprint: 'generated-fingerprint-hash',
    metadata: {}
  });
} catch (error) {
  console.error('Failed to create fingerprint:', error);
}
```

## Debug Mode

When debug mode is enabled, the SDK will log detailed information about:
- API requests and responses
- Presence tracking events
- Fingerprint creation and updates
- Visit logging
- Error details

Enable debug mode in the SDK configuration:
```typescript
const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  debug: true
});
```

## Development

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run integration tests
TEST_MODE=integration npm test

# Build the package
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

## License

MIT