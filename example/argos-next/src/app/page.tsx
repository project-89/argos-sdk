'use client';

import { ImpressionManager } from './components/ImpressionManager';
import { PresenceTracker } from './components/PresenceTracker';
import { ArgosRoot } from './components/ArgosRoot';

export default function Home() {
  return (
    <ArgosRoot>
      <main className="min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-8">Argos SDK Demo</h1>
        <div className="space-y-8">
          <PresenceTracker />
          <ImpressionManager />
        </div>
      </main>
    </ArgosRoot>
  );
}
