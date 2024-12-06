# 🔍 Argos SDK

A powerful toolkit for creating, managing, and interacting with distributed narratives in modern web applications. Built with TypeScript and React.

## Features

- 🔄 Real-time state synchronization
- 👥 User presence and interaction tracking
- 🎯 User identity and fingerprinting
- 🔒 Privacy-first architecture
- ⚡ Lightweight and performant
- 🛡️ TypeScript support
- ⚛️ React hooks included

## Installation

```bash
npm install @project89/argos-sdk
# or
yarn add @project89/argos-sdk
# or
pnpm add @project89/argos-sdk
```

## Environment Setup

Copy `.env.example` to `.env` and configure the following variables:

```bash
# API Configuration
ARGOS_API_URL=https://api.argos.project89.io  # Your Argos API endpoint

# Development Settings
DEBUG=false                # Enable/disable debug logging
HEARTBEAT_INTERVAL=30000   # Presence update interval in milliseconds

# Optional: Test Configuration
TEST_API_URL=http://localhost:3000  # Local test API endpoint
```

## Quick Start

### Basic Usage
```typescript
import { useArgosPresence, ArgosTracker } from '@project89/argos-sdk';

function App() {
  const [tracker, setTracker] = useState<ArgosTracker | null>(null);
  const { presenceState, loading } = useArgosPresence(tracker);

  useEffect(() => {
    // Initialize tracker with a unique identifier
    const initTracker = async () => {
      const uniqueId = Math.random().toString(36).substring(7);
      const tracker = await ArgosTracker.initialize(uniqueId, {
        debug: true,
        metadata: {
          userAgent: navigator.userAgent,
          language: navigator.language
        }
      });
      setTracker(tracker);
    };

    initTracker();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>User Presence</h2>
      <div>Status: {presenceState.status}</div>
      <div>Current Page: {presenceState.currentPage}</div>
      <div>Last Seen: {presenceState.lastSeen?.toLocaleTimeString()}</div>
    </div>
  );
}
```

### Web3 Integration
```typescript
import { useArgosPresence, ArgosTracker } from '@project89/argos-sdk';

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  const [tracker, setTracker] = useState<ArgosTracker | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const { presenceState, loading } = useArgosPresence(tracker);

  useEffect(() => {
    const initTracker = async () => {
      if (window.ethereum && walletAddress) {
        const chainId = await window.ethereum.request({ 
          method: 'eth_chainId' 
        });
        
        const tracker = await ArgosTracker.initialize(walletAddress, {
          debug: true,
          metadata: {
            chainId,
            walletType: 'MetaMask'
          }
        });
        setTracker(tracker);
      }
    };

    initTracker();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      console.error('No Web3 wallet found');
      return;
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    setWalletAddress(accounts[0]);
  };

  if (!walletAddress) {
    return <button onClick={connectWallet}>Connect Wallet</button>;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div>Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
      <div>Status: {presenceState.status}</div>
      <div>Current Page: {presenceState.currentPage}</div>
    </div>
  );
}
```

## Configuration

The SDK can be configured with various options to suit your needs:

```typescript
interface ArgosConfig {
  baseUrl?: string;              // API endpoint
  heartbeatInterval?: number;    // Presence update interval (ms)
  debug?: boolean;               // Enable debug logging
  metadata?: Record<string, any>; // Custom metadata
}
```

## Upcoming Features

- 📚 Narrative Creation & Management
- 🔗 Cross-Platform State Synchronization
- 🎭 Character & Entity Management
- 🌍 World State Management
- 🎨 Interactive Story Elements
- 📊 Analytics & Insights
- 🤝 Multi-User Collaboration
- 🔐 Decentralized Storage Integration

## Documentation

For detailed documentation and API reference, visit our [documentation page](https://github.com/project-89/argos-sdk/docs).

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Community & Support

- 🐦 Follow us on [Twitter](https://twitter.com/project89) for updates
- 💬 Join our [Discord](https://discord.gg/project89) for support
- 🌟 Star us on [GitHub](https://github.com/project-89/argos-sdk)

## License

MIT © [Project89](LICENSE)