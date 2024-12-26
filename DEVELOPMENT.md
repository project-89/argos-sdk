# Development Guide

This guide provides information for developers who want to contribute to or work with the Argos SDK.

## Architecture

The SDK is built on an environment-agnostic architecture that enables seamless operation in any JavaScript environment. This is achieved through several key abstractions:

### Core Components

1. **Environment Interface**
   - Provides environment-specific functionality
   - Handles headers and API responses
   - Manages fingerprint generation
   - Implements environment detection
   - Default implementations for browser and server

2. **Storage Interface**
   - Abstracts storage operations
   - Environment-specific implementations
   - Browser: localStorage with cookie fallback
   - Server: In-memory or custom storage
   - Handles data persistence and cleanup

3. **Base API**
   - Environment-agnostic API client
   - Manages authentication and headers
   - Handles API responses and errors
   - Supports automatic retries
   - Implements API key refresh

### SDK Variants

1. **Base SDK (ArgosSDK)**
   - Environment-agnostic implementation
   - Automatic environment detection
   - Unified API across environments
   - Configurable storage and environment

2. **Server SDK (ArgosServerSDK)**
   - Extends base SDK with server features
   - API key management
   - Server-side fingerprint handling
   - Enhanced security features

3. **React Integration**
   - Browser-specific React components
   - Automatic impression tracking
   - React hooks for SDK functionality
   - Component-level configuration

## Setup

1. Clone the repository:
```bash
git clone https://github.com/oneirocom/argos-sdk.git
cd argos-sdk
```

2. Install dependencies:
```bash
npm install
```

3. Create test environment file:
```bash
cp .env.example .env.test
```

## Testing

The SDK uses a comprehensive testing strategy:

### Unit Tests

```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- src/__tests__/api/BaseAPI.test.ts

# Watch mode
npm test -- --watch
```

### Integration Tests

Integration tests require a running API server:

1. Set up environment:
   ```bash
   # .env.test
   TEST_MODE=integration
   TEST_API_URL=http://127.0.0.1:5001/argos-434718/us-central1/api
   TEST_API_KEY=your-test-key
   ```

2. Run tests:
   ```bash
   npm run test:integration
   ```

### Test Structure

- `src/__tests__/api/` - API client tests
- `src/__tests__/server/` - Server SDK tests
- `src/__tests__/integration/` - End-to-end tests
- `src/__tests__/utils/` - Test utilities and mocks

## Building

```bash
# Full build
npm run build

# Watch mode
npm run build:watch

# Type checking
npm run type-check
```

## Code Style

```bash
# Lint check
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

## Type System

Key type definitions:

- `src/types/api.ts` - API interfaces
- `src/types/runtime.ts` - Environment types
- `src/core/interfaces/` - Core interfaces

Type guidelines:
1. Use strict types, avoid `any`
2. Document complex types
3. Use generics for reusable types
4. Keep interfaces focused

## Development Workflow

1. Create feature branch
2. Implement changes
3. Add/update tests
4. Update documentation
5. Create pull request

## Environment-Specific Development

### Browser Environment

1. Test with different storage types:
   ```typescript
   const sdk = new ArgosSDK({
     baseUrl: 'https://api.example.com',
     storage: new CustomBrowserStorage()
   });
   ```

2. Test with cookies disabled:
   ```typescript
   const sdk = new ArgosSDK({
     baseUrl: 'https://api.example.com',
     storage: new BrowserStorage({ useCookies: false })
   });
   ```

### Server Environment

1. Test with custom storage:
   ```typescript
   const sdk = new ArgosServerSDK({
     baseUrl: 'https://api.example.com',
     apiKey: 'your-key',
     storage: new CustomServerStorage()
   });
   ```

2. Test with different environments:
   ```typescript
   const sdk = new ArgosServerSDK({
     baseUrl: 'https://api.example.com',
     apiKey: 'your-key',
     environment: new CustomServerEnvironment()
   });
   ```

## Debugging

Enable debug mode for detailed logs:

```typescript
const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  debug: true
});
```

Debug information includes:
- API requests and responses
- Environment detection
- Storage operations
- Error details

## Common Issues

### API Key Issues

1. Verify key format and validity
2. Check environment configuration
3. Ensure proper cleanup in tests
4. Handle key refresh correctly

### Environment Detection

1. Check runtime environment
2. Verify environment interface
3. Test storage compatibility
4. Check header handling

### Integration Tests

1. Verify API server status
2. Check environment variables
3. Ensure proper cleanup
4. Handle async operations

## Release Process

1. Update version:
   ```bash
   npm version [patch|minor|major]
   ```

2. Run checks:
   ```bash
   npm run verify
   ```

3. Build and publish:
   ```bash
   npm run build
   npm publish
   ```

4. Create release notes
5. Tag release
6. Update documentation