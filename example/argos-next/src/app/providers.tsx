'use client';

import { ArgosProvider } from '@project89/argos-sdk';

interface ProvidersProps {
  children: JSX.Element | JSX.Element[];
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ArgosProvider
      config={{
        baseUrl: process.env.NEXT_PUBLIC_ARGOS_API_URL!,
        debug: true,
      }}
    >
      {children}
    </ArgosProvider>
  );
}
