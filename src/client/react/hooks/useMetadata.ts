import { useCallback } from 'react';
import { useFingerprint } from './useFingerprint';
import { useArgosSDK } from './useArgosSDK';

interface UseMetadataReturn {
  metadata: Record<string, unknown> | undefined;
  addMetadata: (fields: Record<string, unknown>) => Promise<void>;
}

export function useMetadata(): UseMetadataReturn {
  const { fingerprintId, fingerprint } = useFingerprint();
  const sdk = useArgosSDK();

  const addMetadata = useCallback(
    async (fields: Record<string, unknown>) => {
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
