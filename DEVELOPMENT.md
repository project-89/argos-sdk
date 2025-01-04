# Development Guide

This guide provides information for developers who want to contribute to or work with the Argos SDK.

## Architecture

The SDK is built on an environment-agnostic architecture that enables seamless operation in any JavaScript environment. This is achieved through several key abstractions:

### Core Components

1. **Environment Interface**
   - Provides environment-specific functionality
   - Handles HTTP requests and responses
   - Manages API key storage
   - Implements environment detection
   - Key implementations:
     - `BrowserEnvironment`: Browser-specific implementation
     - `NodeEnvironment`: Node.js-specific implementation
     - `TestEnvironment`: Testing environment

2. **Storage Interface**
   - Abstracts storage operations
   - Environment-specific implementations:
     - Browser: 
       - `CookieStorage` (default)
       - Custom implementation support
     - Server:
       - `SecureStorage` (default, encrypted)
       - Custom implementation support

3. **Base API**
   - Environment-agnostic API client
   - Manages authentication and headers
   - Handles API responses and errors
   - Implements:
     - Rate limiting
     - Request queueing
     - Automatic retries
     - Error handling

4. **API Implementations**
   - `FingerprintAPI`: Identity management
   - `ImpressionAPI`: Tracking and analytics
   - `APIKeyAPI`: Key management and validation

### SDK Variants

1. **Client SDK (ArgosClientSDK)**
   - Browser-optimized implementation
   - Features:
     - Automatic fingerprint generation
     - Browser state detection
     - Presence tracking
     - React integration
   - Rate limits:
     - 300 requests/hour (IP-based)
     - ~5 requests/minute distribution

2. **Server SDK (ArgosServerSDK)**
   - Node.js-optimized implementation
   - Features:
     - Enhanced API key management
     - Secure storage
     - Higher rate limits
   - Rate limits:
     - 1000 requests/hour (fingerprint-based)
     - ~16 requests/minute distribution

3. **React Integration**
   - Components:
     - `ArgosProvider`: SDK context provider
     - `useArgosSDK`: SDK access hook
     - `useImpressions`: Impression management hook
     - `useMetadata`: Metadata management hook

## Development Workflow

1. **Setup Environment**
```bash
# Install dependencies
npm install

# Create test environment
cp .env.example .env.test

# Build SDK
npm run build

# Start development server
npm run dev
```

2. **Testing**

```bash
# Unit tests
npm run test:unit

# Integration tests (requires API server)
npm run test:integration

# Coverage report
npm run test:coverage
```

3. **Code Quality**

```bash
# Lint code
npm run lint

# Type check
npm run type-check

# Format code
npm run format
```

4. **Documentation**

```bash
# Generate API documentation
npm run docs

# Serve documentation locally
npm run docs:serve
```

## Best Practices

1. **Error Handling**
   - Use typed error responses
   - Implement proper error recovery
   - Provide meaningful error messages

2. **Testing**
   - Write unit tests for all new features
   - Use `TestEnvironment` for controlled testing
   - Mock external dependencies

3. **Type Safety**
   - Maintain strict TypeScript configuration
   - Use proper type guards
   - Document complex types

4. **Performance**
   - Implement proper request batching
   - Use appropriate storage strategies
   - Handle rate limiting gracefully

5. **Security**
   - Never expose API keys in client code
   - Use secure storage for sensitive data
   - Implement proper key rotation

## Release Process

1. **Version Bump**
   ```bash
   npm version [major|minor|patch]
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Testing**
   ```bash
   npm run test:all
   ```

4. **Documentation**
   - Update README.md
   - Update API documentation
   - Update CHANGELOG.md

5. **Publishing**
   ```bash
   npm publish
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Add tests
5. Update documentation
6. Submit pull request

## Environment-Specific Development

### Browser Environment

1. Test with custom storage:
   ```typescript
   const sdk = new ArgosSDK({
     baseUrl: 'https://api.example.com',
     storage: new CustomBrowserStorage()
   });
   ```

2. Configure cookie options:
   ```typescript
   const sdk = new ArgosSDK({
     baseUrl: 'https://api.example.com',
     storage: new CookieStorage({
       secure: true,
       sameSite: 'strict',
       path: '/',
       domain: 'your-domain.com'
     })
   });
   ```

### Server Environment

1. Configure secure storage:
   ```typescript
   const sdk = new ArgosServerSDK({
     baseUrl: 'https://api.example.com',
     apiKey: 'your-key',
     storage: new SecureStorage({
       encryptionKey: 'your-encryption-key',
       storagePath: '/custom/path/to/storage'
     })
   });
   ```

2. Test with custom storage:
   ```typescript
   const sdk = new ArgosServerSDK({
     baseUrl: 'https://api.example.com',
     apiKey: 'your-key',
     storage: new CustomServerStorage()
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