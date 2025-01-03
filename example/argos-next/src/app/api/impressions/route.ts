import { NextRequest, NextResponse } from 'next/server';
import { ArgosServerSDK } from '@project89/argos-sdk/server';

// Cookie management helper
const setApiKeyCookie = (apiKey: string) => {
  // Set cookie for 30 days
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return `argos_api_key=${encodeURIComponent(
    apiKey
  )}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax`;
};

const getSDK = (apiKey: string): ArgosServerSDK => {
  if (!process.env.NEXT_PUBLIC_ARGOS_API_URL) {
    throw new Error('NEXT_PUBLIC_ARGOS_API_URL is required');
  }

  const sdk = new ArgosServerSDK({
    baseUrl: process.env.NEXT_PUBLIC_ARGOS_API_URL,
    debug: true,
    encryptionKey:
      process.env.ENCRYPTION_KEY || 'test-key-32-chars-secure-storage-ok',
  });
  sdk.setApiKey(apiKey);
  return sdk;
};

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'API key is required' },
      { status: 401 }
    );
  }

  const fingerprintId = request.nextUrl.searchParams.get('fingerprintId');
  if (!fingerprintId) {
    return NextResponse.json(
      { success: false, error: 'Fingerprint ID is required' },
      { status: 400 }
    );
  }

  try {
    const sdk = getSDK(apiKey);
    const response = await sdk.getImpressions(fingerprintId);
    const nextResponse = NextResponse.json(response);
    // Set cookie on successful response
    nextResponse.headers.set('Set-Cookie', setApiKeyCookie(apiKey));
    return nextResponse;
  } catch (error) {
    console.error('Failed to get impressions:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'API key is required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { fingerprintId, type, data } = body;

    if (!fingerprintId) {
      return NextResponse.json(
        { success: false, error: 'Fingerprint ID is required' },
        { status: 400 }
      );
    }

    const sdk = getSDK(apiKey);
    const response = await sdk.track(type, {
      fingerprintId,
      ...data,
    });
    const nextResponse = NextResponse.json(response);
    // Set cookie on successful response
    nextResponse.headers.set('Set-Cookie', setApiKeyCookie(apiKey));
    return nextResponse;
  } catch (error) {
    console.error('Failed to create impression:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'API key is required' },
      { status: 401 }
    );
  }

  const fingerprintId = request.nextUrl.searchParams.get('fingerprintId');
  if (!fingerprintId) {
    return NextResponse.json(
      { success: false, error: 'Fingerprint ID is required' },
      { status: 400 }
    );
  }

  try {
    const sdk = getSDK(apiKey);
    const response = await sdk.deleteImpressions(fingerprintId);
    const nextResponse = NextResponse.json(response);
    // Set cookie on successful response
    nextResponse.headers.set('Set-Cookie', setApiKeyCookie(apiKey));
    return nextResponse;
  } catch (error) {
    console.error('Failed to delete impressions:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
