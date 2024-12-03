import React, { useEffect, useState } from "react";
import { OneiroTracker } from "@project89/argos-sdk";

function App() {
  const [status, setStatus] = useState<string>("Initializing...");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let tracker: OneiroTracker;

    async function initializeTracker() {
      try {
        // In a real application, you would generate this using a fingerprinting library
        const fingerprintId =
          "example-" + Math.random().toString(36).substring(7);

        tracker = await OneiroTracker.initialize(fingerprintId, {
          baseUrl: "your-api-endpoint",
          debug: true,
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

    initializeTracker();

    // Cleanup on unmount
    return () => {
      if (tracker) {
        tracker.cleanup();
      }
    };
  }, []);

  return (
    <div className="App">
      <h1>Argos SDK React Example</h1>
      <div>Status: {status}</div>
      {userId && <div>User ID: {userId}</div>}
    </div>
  );
}

export default App;
