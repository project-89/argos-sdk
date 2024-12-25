# Development Guide

This guide provides information for developers who want to contribute to or work with the Argos SDK.

## Architecture

The SDK is designed to be environment-agnostic, allowing it to run in both browser and server environments. This is achieved through several key components:

### Core Components

1. **Environment Interface**
   - Abstracts environment-specific functionality
   - Provides methods for online status and user agent
   - Default implementations for browser and server

2. **Storage Interface**
   - Abstracts storage functionality
   - Provides methods for key-value storage
   - Default implementations for browser (localStorage) and server (memory)

3. **Base API**
   - Handles common API functionality
   - Manages authentication and headers
   - Supports both public and protected routes

### SDK Variants

1. **Client SDK (ArgosSDK)**
   - Browser-optimized implementation
   - Automatic environment detection
   - React hooks and components

2. **Server SDK (ArgosServerSDK)**
   - Server-optimized implementation
   - API key management
   - Environment-agnostic tracking

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

## Testing

The SDK uses Jest for testing and includes both unit tests and integration tests.

### Unit Tests

Unit tests mock external dependencies and test individual components in isolation:

```bash
npm test
```

### Integration Tests

Integration tests interact with a real API server. To run integration tests:

1. Make sure you have the API server running locally
2. Set the required environment variables in `.env.test`:
   ```
   TEST_MODE=integration
   TEST_API_URL=http://127.0.0.1:5001/argos-434718/us-central1/api
   ```

3. Run the tests:
```bash
npm run test:integration
```

### Test Structure

- `src/__tests__/api/` - API client tests
- `src/__tests__/server/` - Server SDK tests
- `src/__tests__/integration/` - End-to-end integration tests
- `src/__tests__/utils/` - Test utilities

## Building

To build the SDK:

```bash
npm run build
```

This will:
1. Clean the `dist` directory
2. Compile TypeScript files
3. Generate type declarations
4. Bundle the SDK for different module systems (ESM, CJS)

## Code Style

We use ESLint and Prettier to maintain code quality and consistency:

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Type System

The SDK uses TypeScript for type safety. Key type definitions can be found in:

- `src/types/api.ts` - API types
- `src/core/interfaces/environment.ts` - Environment interfaces
- `src/core/interfaces/storage.ts` - Storage interfaces

When making changes:
1. Ensure all new code is properly typed
2. Update type definitions when changing interfaces
3. Avoid using `any` type unless absolutely necessary
4. Add JSDoc comments for public APIs

## Making Changes

1. Create a new branch for your changes
2. Make your changes
3. Add or update tests as needed
4. Run the test suite
5. Update documentation if necessary
6. Submit a pull request

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Run tests and build
4. Create a git tag
5. Push to repository
6. Publish to npm

```bash
npm version [patch|minor|major]
npm run build
npm publish
```

## Debugging

When debugging issues:

1. Enable debug mode in the SDK:
```typescript
const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  debug: true
});
```

2. Check the console for detailed logs:
   - API requests and responses
   - Event tracking
   - Error details

3. Use integration tests to verify API behavior:
   - Run tests with `TEST_MODE=integration`
   - Check API server logs
   - Verify request/response payloads

## Common Issues

### Integration Tests Failing

1. Verify the API server is running
2. Check environment variables in `.env.test`
3. Ensure the API server URL is correct
4. Check the API server logs for errors

### Build Issues

1. Clear the `dist` directory
2. Delete `node_modules` and reinstall dependencies
3. Check TypeScript compiler errors
4. Verify module imports/exports

### Environment-specific Issues

1. Check environment detection logic
2. Verify environment interface implementation
3. Test in both browser and server contexts
4. Check storage interface implementation