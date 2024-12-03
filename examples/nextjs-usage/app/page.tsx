"use client";

import { useEffect, useState } from "react";
import { OneiroTracker } from "@project89/argos-sdk";

export default function Home() {
  const [status, setStatus] = useState<string>("Initializing...");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let tracker: OneiroTracker;

    async function initializeTracker() {
      try {
        // In a real application, you would use a fingerprinting library
        const fingerprintId =
          "example-" + Math.random().toString(36).substring(7);

        tracker = await OneiroTracker.initialize(fingerprintId, {
          baseUrl: process.env.NEXT_PUBLIC_API_ENDPOINT,
          debug: process.env.NODE_ENV === "development",
        });

        // Start tracking presence
        await tracker.trackPresence("example-site");

        // Get user information
        const user = await tracker.getUser();

        setUserId(user?.id || fingerprintId);
        setStatus("Tracking active");
      } catch (error) {
        setStatus(
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Only initialize on client-side
    if (typeof window !== "undefined") {
      initializeTracker();
    }

    return () => {
      if (tracker) {
        tracker.cleanup();
      }
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Argos SDK Next.js Example</h1>
        <div className="bg-gray-100 rounded-lg p-6 mb-4">
          <p className="text-lg mb-2">Status: {status}</p>
          {userId && <p className="text-lg">User ID: {userId}</p>}
        </div>
      </div>
    </main>
  );
}
