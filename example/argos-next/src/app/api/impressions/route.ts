import { NextRequest, NextResponse } from 'next/server';
import { ArgosServerSDK } from '@project89/argos-sdk/server';

const getSDK = (apiKey: string) => {
  return new ArgosServerSDK({
    baseUrl: process.env.NEXT_PUBLIC_ARGOS_API_URL!,
    apiKey,
    debug: true,
  });
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
    return NextResponse.json(response);
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
    return NextResponse.json(response);
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
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete impressions:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
