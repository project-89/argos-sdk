# Argos SDK

The Argos SDK is a versatile tracking and analytics library that works seamlessly in both browser and server environments. It provides a unified API for tracking visits, presence, and custom events.

## Features

- 🌐 Environment-agnostic - works in both browser and server environments
- 🔄 Unified tracking API across environments
- 🔒 Secure fingerprint-based identification
- 📊 Real-time analytics and tracking
- ⚛️ React hooks and components (browser only)
- 🔑 API key management
- 🚀 TypeScript support

## Installation

```bash
npm install @project89/argos-sdk
```

## Quick Start

### Browser Usage

```typescript
import { ArgosSDK } from '@project89/argos-sdk';

// Initialize the SDK
const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com'
});

// Track a visit
await sdk.track('visit', {
  url: window.location.href,
  referrer: document.referrer
});

// Track presence
await sdk.track('presence', {
  duration: 30,
  active: true
});

// Track custom events
await sdk.track('custom', {
  event: 'button_click',
  data: { buttonId: 'submit' }
});
```

### React Components

```typescript
import { ImpressionManager } from '@project89/argos-sdk/react';

function App() {
  return (
    <ImpressionManager
      baseUrl="https://api.example.com"
      onError={(error) => console.error(error)}
    >
      {/* Your app content */}
    </ImpressionManager>
  );
}
```

### Server Usage

```typescript
import { ArgosServerSDK } from '@project89/argos-sdk/server';

// Initialize the server SDK
const serverSdk = new ArgosServerSDK({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key'
});

// Track a visit
await serverSdk.track('visit', {
  url: 'https://example.com/page',
  referrer: 'https://google.com'
});

// Track presence
await serverSdk.track('presence', {
  duration: 30,
  active: true
});

// Track custom events
await serverSdk.track('custom', {
  event: 'api_call',
  data: { endpoint: '/api/data' }
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
    const result = await serverSdk.track(req.body.type, req.body.data);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## Configuration

### Client SDK Options

```typescript
interface ArgosSDKOptions {
  baseUrl: string;
  debug?: boolean;
  storage?: StorageInterface;
  environment?: EnvironmentInterface;
}
```

### Server SDK Options

```typescript
interface ArgosServerSDKOptions {
  baseUrl: string;
  apiKey: string;
  debug?: boolean;
  storage?: StorageInterface;
  environment?: EnvironmentInterface;
}
```

## API Reference

### Track Method

The `track` method is the unified way to send events to the Argos API:

```typescript
track(type: 'visit' | 'presence' | 'custom', data: TrackData): Promise<void>
```

#### Visit Event

```typescript
interface VisitData {
  url: string;
  referrer?: string;
  metadata?: Record<string, any>;
}
```

#### Presence Event

```typescript
interface PresenceData {
  duration: number;
  active: boolean;
  metadata?: Record<string, any>;
}
```

#### Custom Event

```typescript
interface CustomData {
  event: string;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}
```

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for information about contributing to the SDK.

## License

MIT License - see [LICENSE](LICENSE) for details.