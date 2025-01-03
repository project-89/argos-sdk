'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { ArgosProvider } from '@project89/argos-sdk/client/react';

interface ArgosRootProps {
  children: ReactNode;
}

export function ArgosRoot({ children }: ArgosRootProps) {
  // Use state to ensure the provider only renders on the client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ArgosProvider
      config={{
        baseUrl:
          process.env.NEXT_PUBLIC_ARGOS_API_URL || 'http://localhost:3001',
        debug: true,
      }}
      onError={console.error}
    >
      {children}
    </ArgosProvider>
  );
}
