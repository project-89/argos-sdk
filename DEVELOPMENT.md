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

# Run tests in watch mode
npm run test:watch
```

2. **Testing**

```bash
# Run all tests
npm test

# Run specific test file
npm test path/to/test.ts

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

## Security Guidelines

1. **API Key Management**
   - Store API keys using environment variables
   - Never commit API keys to version control
   - Implement proper key rotation
   - Use short-lived keys when possible

2. **Storage Security**
   - Server:
     - Use `SecureStorage` with proper encryption
     - Store encryption keys securely
     - Implement proper file permissions
   - Browser:
     - Prefer `HttpOnly` cookies when possible
     - Implement XSS protections
     - Clear sensitive data on logout

3. **Rate Limiting**
   - Configure appropriate limits:
     ```typescript
     const sdk = new ArgosSDK({
       baseUrl: 'https://api.example.com',
       maxRequestsPerHour: 1000,
       maxRequestsPerMinute: 60
     });
     ```
   - Handle rate limit errors:
     ```typescript
     try {
       await sdk.track('event', data);
     } catch (error) {
       if (error.retryAfter) {
         // Implement retry logic
       }
     }
     ```

4. **Error Handling**
   - Never log sensitive data:
     ```typescript
     // Good
     console.error('API error:', error.message);
     
     // Bad
     console.error('API error:', error); // Might contain sensitive data
     ```
   - Sanitize error messages:
     ```typescript
     const sanitizeError = (error: Error) => ({
       message: error.message,
       code: error.code,
       // Exclude stack traces and sensitive fields
     });
     ```

5. **Testing Security**
   - Use mock API keys in tests
   - Test error scenarios
   - Validate security headers
   - Test rate limiting
   ```typescript
   describe('Security', () => {
     it('should handle invalid API keys', async () => {
       expect.assertions(1);
       try {
         await sdk.validateAPIKey('invalid-key');
       } catch (error) {
         expect(error.message).toContain('Invalid API key');
       }
     });
   });
   ```

## Environment-Specific Development

### Browser Environment

1. Test with secure cookie storage:
   ```typescript
   const sdk = new ArgosSDK({
     baseUrl: 'https://api.example.com',
     storage: new CookieStorage({
       secure: true, // Requires HTTPS
       sameSite: 'strict',
       httpOnly: true, // When possible
       path: '/',
       domain: 'your-domain.com'
     })
   });
   ```

2. Implement proper error boundaries:
   ```typescript
   <ArgosProvider
     config={{
       baseUrl: 'https://api.example.com',
       onError: (error) => {
         // Handle errors securely
         reportError(sanitizeError(error));
       }
     }}
   >
     <App />
   </ArgosProvider>
   ```

### Server Environment

1. Configure secure storage with environment variables:
   ```typescript
   const sdk = new ArgosServerSDK({
     baseUrl: process.env.ARGOS_API_URL,
     apiKey: process.env.ARGOS_API_KEY,
     storage: new SecureStorage({
       encryptionKey: process.env.ARGOS_ENCRYPTION_KEY,
       storagePath: process.env.ARGOS_STORAGE_PATH
     })
   });
   ```

2. Implement proper key rotation:
   ```typescript
   class KeyRotationManager {
     private readonly sdk: ArgosServerSDK;
     private rotationInterval: number;

     async rotateKey(): Promise<void> {
       try {
         const result = await this.sdk.rotateAPIKey();
         if (result.success) {
           process.env.ARGOS_API_KEY = result.data.key;
         }
       } catch (error) {
         // Handle rotation failure
       }
     }
   }
   ```

## Debugging

Enable debug mode only in development:

```typescript
const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  debug: process.env.NODE_ENV === 'development'
});
```

For production debugging, implement secure logging:
```typescript
const sdk = new ArgosSDK({
  baseUrl: 'https://api.example.com',
  onError: (error) => {
    // Log only safe information
    logger.error({
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }
});
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