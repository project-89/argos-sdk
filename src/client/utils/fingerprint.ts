import * as FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function getBrowserFingerprint(): Promise<string> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}
