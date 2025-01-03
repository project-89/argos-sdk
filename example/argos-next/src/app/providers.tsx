'use client';

import { ArgosProvider } from '@project89/argos-sdk/client/react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const baseUrl = process.env.NEXT_PUBLIC_ARGOS_API_URL;

  if (!baseUrl) {
    console.error('NEXT_PUBLIC_ARGOS_API_URL is not defined');
    return null;
  }

  return (
    <ArgosProvider
      config={{
        baseUrl,
        debug: true,
      }}
    >
      {children}
    </ArgosProvider>
  );
}
