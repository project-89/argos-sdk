# Contributing to Argos SDK

We love your input! We want to make contributing to Argos SDK as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Package Publishing

While this is an open source project, the npm package `@project89/argos-sdk` is maintained and published by the Project89 team. This ensures package quality and security. If you have changes that you'd like to see published:

1. Submit your changes via a pull request
2. Once approved and merged, the Project89 team will handle the npm publishing
3. Package versions follow semantic versioning (MAJOR.MINOR.PATCH)

## Development Setup

1. Fork the repo and create your branch from `main`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment:
   - Copy `.env.example` to `.env`
   - Configure the environment variables:
     ```bash
     # API Configuration
     ARGOS_API_URL=https://api.argos.project89.io  # Your Argos API endpoint

     # Development Settings
     DEBUG=true                 # Enable debug logging during development
     HEARTBEAT_INTERVAL=30000   # Presence update interval in milliseconds

     # Optional: Test Configuration
     TEST_API_URL=http://localhost:3000  # Local test API endpoint
     ```
4. If you've added code that should be tested, add tests.
5. If you've changed APIs, update the documentation.
6. Ensure the test suite passes:
   ```bash
   npm test
   ```
7. Make sure your code lints:
   ```bash
   npm run lint
   ```
8. Build the package locally to verify your changes:
   ```bash
   npm run build
   ```
9. Issue that pull request!

## TypeScript Guidelines

The Argos SDK is written in TypeScript and we maintain strict type safety throughout the codebase:

1. Always define proper interfaces for your data structures
2. Use strict type checking (no `any` unless absolutely necessary)
3. Document your types with JSDoc comments
4. Ensure your changes maintain backward compatibility of types
5. Update type declarations if you modify the public API

Example of good type usage:

```typescript
/**
 * Configuration for fingerprint creation
 */
interface FingerprintConfig {
  /** User agent string from the browser */
  userAgent: string;
  /** IP address of the client */
  ip: string;
  /** Optional metadata for the fingerprint */
  metadata?: Record<string, unknown>;
}

/**
 * Creates a new fingerprint
 * @param config - The fingerprint configuration
 * @returns A promise that resolves with the fingerprint response
 */
async function createFingerprint(config: FingerprintConfig): Promise<ApiResponse<Fingerprint>> {
  // Implementation
}
```

## Build Process

The SDK uses a two-step build process:

1. Rollup bundles the code into ESM and CJS formats
2. TypeScript generates type declarations

Key build files:
- `rollup.config.mjs` - Configures the bundle generation
- `tsconfig.json` - TypeScript configuration
- `package.json` - Defines build scripts and package structure

When making changes:
1. Ensure your code builds without errors: `npm run build`
2. Test both ESM and CJS builds
3. Verify type declarations are generated correctly
4. Check the bundle size remains reasonable

## Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issue tracker](https://github.com/project-89/argos-sdk/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/project-89/argos-sdk/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
  - Include TypeScript types if relevant
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License
By contributing, you agree that your contributions will be licensed under its MIT License. 