import { useState, useEffect } from "react";
import { ArgosTracker } from "../ArgosTracker";
import type { ArgosUser } from "../types";

export function useArgosUser(tracker: ArgosTracker | null) {
  const [user, setUser] = useState<ArgosUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tracker) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await tracker.getUser();
        setUser(userData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch user"),
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [tracker]);

  return { user, loading, error };
}
