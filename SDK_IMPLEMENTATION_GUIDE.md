# Argos Server SDK Implementation Guide

## Overview
The Argos Server provides a secure API for digital identity management, visit tracking, and price data analytics. This document outlines everything needed to implement a client SDK.

## Base Configuration
- Production Base URL: `https://argos.project89.org`
- Local Development URL: `http://127.0.0.1:5001/argos-434718/us-central1/api`
- Emulator UI: `http://127.0.0.1:4000`
- Emulator Ports:
  - Functions: 5001
  - Firestore: 8080
  - Emulator Hub: 4400
- Rate Limits:
  - IP-based: 300 requests per hour
  - Fingerprint-based: 1000 requests per hour
- Authentication: API key required in `x-api-key` header
- Response Format: JSON with standard structure:
  ```typescript
  interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  ```

## Core Endpoints

### Identity Management

#### 1. Register Fingerprint
```typescript
POST /fingerprint/register
Body: {
  fingerprint: string;
  metadata?: {
    [key: string]: any;
  };
}
Response: {
  id: string;
  fingerprint: string;
  roles: string[];
  createdAt: string;
  metadata: object;
}
```

#### 2. Get Fingerprint
```typescript
GET /fingerprint/:id
Headers: {
  x-api-key: string;
}
Response: {
  id: string;
  fingerprint: string;
  roles: string[];
  createdAt: string;
  metadata: object;
}
```

#### 3. Register API Key
```typescript
POST /api-key/register
Body: {
  fingerprintId: string;
}
Response: {
  key: string;
  fingerprintId: string;
  expiresAt: string;
}
```

#### 4. Validate API Key
```typescript
POST /api-key/validate
Body: {
  key: string;
}
Response: {
  valid: boolean;
  fingerprintId?: string;
}
```

#### 5. Revoke API Key
```typescript
POST /api-key/revoke
Headers: {
  x-api-key: string;
}
Body: {
  key: string;
}
Response: {
  success: boolean;
}
```

### Visit Tracking

#### 1. Log Visit
```typescript
POST /visit/log
Headers: {
  x-api-key: string;
}
Body: {
  fingerprintId: string;
  url: string;
  title?: string;
  metadata?: {
    [key: string]: any;
  };
}
Response: {
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
```

#### 2. Update Presence
```typescript
POST /visit/presence
Headers: {
  x-api-key: string;
}
Body: {
  fingerprintId: string;
  status: "active" | "inactive";
  metadata?: {
    [key: string]: any;
  };
}
Response: {
  success: boolean;
  timestamp: string;
}
```

#### 3. Get Visit History
```typescript
GET /visit/history/:fingerprintId
Headers: {
  x-api-key: string;
}
Query Parameters: {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}
Response: {
  visits: Array<{
    id: string;
    fingerprintId: string;
    url: string;
    title: string;
    timestamp: string;
    site: {
      domain: string;
      visitCount: number;
    };
  }>;
}
```

### Price Data

#### 1. Get Current Prices
```typescript
GET /price/current
Query Parameters: {
  tokens?: string[]; // Comma-separated token IDs
}
Response: {
  prices: {
    [tokenId: string]: {
      price: number;
      timestamp: string;
      change24h?: number;
    };
  };
}
```

#### 2. Get Price History
```typescript
GET /price/history/:tokenId
Query Parameters: {
  interval?: "1h" | "24h" | "7d" | "30d";
  limit?: number;
}
Response: {
  history: Array<{
    price: number;
    timestamp: string;
  }>;
}
```

### System

#### 1. Health Check
```typescript
GET /health
Response: {
  status: "ok" | "error";
  version: string;
  timestamp: string;
}
```

#### 2. Available Roles
```typescript
GET /role/available
Response: {
  roles: string[];
}
```

## Error Handling

### Standard Error Codes
- 400: Bad Request (invalid parameters)
- 401: Unauthorized (missing or invalid API key)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error

### Rate Limit Response
```typescript
Status: 429
{
  success: false;
  error: "Too many requests, please try again later";
  retryAfter: number; // Seconds until next allowed request
}
```

## SDK Implementation Requirements

1. **Authentication Management**
   - Store and manage API keys securely
   - Handle API key rotation and expiration
   - Implement automatic retry with backoff for rate limits

2. **Request Handling**
   - Implement proper error handling and type checking
   - Support request cancellation
   - Handle network timeouts and retries

3. **Type Safety**
   - Provide TypeScript definitions for all endpoints
   - Include runtime type checking for responses
   - Export proper type definitions for public API

4. **Configuration**
   - Allow base URL configuration
   - Support custom headers and timeout settings
   - Enable debug mode for detailed logging

5. **Browser Support**
   - Support modern browsers (last 2 versions)
   - Handle CORS properly
   - Implement proper cleanup for browser environments

6. **Testing Requirements**
   - Include unit tests for all endpoints
   - Provide mocking utilities for testing
   - Include integration test examples

## Security Considerations

1. **API Key Handling**
   - Never store API keys in localStorage/sessionStorage
   - Implement secure key rotation
   - Clear keys on session end

2. **Request Security**
   - Use HTTPS only
   - Validate all input data
   - Sanitize URLs and metadata

3. **Error Handling**
   - Never expose sensitive data in errors
   - Implement proper error recovery
   - Log security-related errors

## Best Practices

1. **Rate Limiting**
   - Implement client-side rate limiting
   - Queue requests when approaching limits
   - Provide rate limit status to applications

2. **Caching**
   - Cache price data appropriately
   - Implement proper cache invalidation
   - Support custom cache configurations

3. **Performance**
   - Minimize bundle size
   - Support tree shaking
   - Implement request batching where appropriate 