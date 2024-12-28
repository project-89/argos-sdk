# Argos SDK Demo App

This Next.js application demonstrates the environment-agnostic capabilities of the Argos SDK, showcasing both client-side and server-side implementations.

## Features

- Client-side impression tracking using React hooks
- Server-side impression management via API routes
- Fingerprint integration
- Real-time impression updates
- Error handling and loading states
- Modern UI with Tailwind CSS

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_ARGOS_API_URL=your_api_url
   ```
4. Set your API key in a cookie named `argos_api_key`
5. Start the development server:
   ```bash
   npm run dev
   ```

## Implementation Details

### Client-side Features
- Uses `useImpressions` and `useFingerprint` hooks from `@project89/argos-sdk`
- Real-time impression creation and tracking
- Automatic fingerprint generation

### Server-side Features
- Implements REST API endpoints for impression management
- Uses `ArgosServerSDK` for secure server-side operations
- Proper error handling and status codes

## Component Structure

- `ImpressionManager.tsx`: Main component demonstrating both client and server-side features
- `providers.tsx`: Sets up the ArgosProvider with configuration
- API routes in `api/impressions` for server-side operations

## Best Practices Demonstrated

- Environment-agnostic SDK usage
- Proper error handling
- Loading state management
- API key security
- TypeScript integration
- Modern React patterns
