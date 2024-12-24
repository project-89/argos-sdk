# Development Guide

This guide provides information for developers who want to contribute to or work with the Argos SDK.

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

1. Make sure you have the API server running locally or have access to a test environment
2. Set the required environment variables:
   - `TEST_MODE=integration`
   - `TEST_API_URL` (optional, defaults to local development server)
   - `TEST_API_KEY` (optional, defaults to test key)

```bash
TEST_MODE=integration npm test
```

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

The SDK uses TypeScript for type safety. Key type definitions can be found in `src/types/api.ts`. When making changes:

1. Ensure all new code is properly typed
2. Update type definitions when changing API interfaces
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

## Architecture

The SDK is organized into several key components:

- `src/api/` - API client implementations
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/__tests__/` - Test files

### Key Files

- `src/api/BaseAPI.ts` - Base class for API clients
- `src/api/FingerprintAPI.ts` - Fingerprint-related API methods
- `src/types/api.ts` - API type definitions
- `src/index.ts` - Main entry point

## Debugging

When debugging issues:

1. Enable debug mode in the SDK:
```typescript
const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  debug: true
});
```

2. Check the browser console for detailed logs
3. Use integration tests to verify API behavior
4. Check network requests in browser dev tools

## Common Issues

### Integration Tests Failing

1. Verify the API server is running
2. Check environment variables are set correctly
3. Ensure you have the correct API key
4. Check the API server logs for errors

### Build Issues

1. Clear the `dist` directory
2. Delete `node_modules` and reinstall dependencies
3. Check TypeScript compiler errors
4. Verify module imports/exports