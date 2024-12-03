import { useState, useEffect } from "react";
import { PresenceData } from "../types";
import { ArgosTracker } from "../ArgosTracker";

export function useArgosPresence(tracker: ArgosTracker | null) {
  const [presenceState, setPresenceState] = useState<PresenceData>({
    userId: "",
    status: "offline",
    lastSeen: new Date(),
    currentPage: undefined,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tracker) {
      setLoading(false);
      return;
    }

    const siteId = window.location.hostname;

    const initPresence = async () => {
      try {
        await tracker.trackPresence(siteId);
        setPresenceState({
          userId: "current",
          status: "online",
          lastSeen: new Date(),
          currentPage: window.location.pathname,
        });
      } catch (error) {
        console.error("Failed to initialize presence:", error);
      } finally {
        setLoading(false);
      }
    };

    initPresence();

    return () => {
      tracker.cleanup();
    };
  }, [tracker]);

  return { presenceState, loading };
}
