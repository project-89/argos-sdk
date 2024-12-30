/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { useFingerprint } from './useFingerprint';
import { useArgosSDK } from './useArgosSDK';

interface UseMetadataReturn {
  metadata: Record<string, any> | undefined;
  addMetadata: (fields: Record<string, any>) => Promise<void>;
}

export function useMetadata(): UseMetadataReturn {
  const { fingerprintId, fingerprint } = useFingerprint();
  const sdk = useArgosSDK();

  const addMetadata = useCallback(
    async (fields: Record<string, any>) => {
      if (!fingerprintId) {
        throw new Error('Fingerprint ID is required');
      }

      const updatedMetadata = {
        ...fingerprint?.metadata,
        ...fields,
      };

      await sdk.updateFingerprint(fingerprintId, updatedMetadata);
    },
    [fingerprintId, fingerprint, sdk]
  );

  return {
    metadata: fingerprint?.metadata,
    addMetadata,
  };
}
