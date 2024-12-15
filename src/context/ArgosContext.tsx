import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from "react";
import { ArgosSDK, ArgosSDKConfig } from "../ArgosSDK";
import { FingerprintData } from "../types/api";

interface ArgosContextType {
  sdk: ArgosSDK;
  isOnline: boolean;
  fingerprintId: string | null;
  fingerprint: FingerprintData | null;
  isLoading: boolean;
  error: Error | null;
  updateMetadata: (metadata: Record<string, any>) => Promise<void>;
}

interface ArgosProviderProps {
  config: ArgosSDKConfig;
  children: ReactNode;
  onError?: (error: Error) => void;
  debug?: boolean;
}

const STORAGE_KEYS = {
  FINGERPRINT_ID: "argos_fp_id",
  API_KEY: "argos_api_key",
} as const;

const log = (debug: boolean, ...args: any[]) => {
  if (debug) {
    console.log("[Argos]", ...args);
  }
};

export const ArgosContext = createContext<ArgosContextType | undefined>(
  undefined
);

export function ArgosProvider({
  config,
  children,
  onError,
  debug = false,
}: ArgosProviderProps) {
  const [sdk] = useState(() => new ArgosSDK({ ...config, debug }));
  const [isOnline, setIsOnline] = useState(sdk.isOnline());
  const [fingerprintId, setFingerprintId] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback(
    (error: Error, silent = false) => {
      setError(error);
      if (onError && !silent) {
        onError(error);
      } else if (debug || !silent) {
        console.error("[Argos]", error);
      }
    },
    [onError, debug]
  );

  const ensureApiKey = useCallback(
    async (id: string) => {
      try {
        // Check for stored API key
        const storedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
        if (storedApiKey) {
          log(debug, "Found stored API key");
          sdk.setApiKey(storedApiKey);
          return;
        }

        // Register new API key
        log(debug, "Registering new API key");
        const response = await sdk.registerApiKey(id, {
          source: "web-sdk",
          createdAt: new Date().toISOString(),
        });

        if (response.success && response.data.key) {
          log(debug, "API key registration successful");
          localStorage.setItem(STORAGE_KEYS.API_KEY, response.data.key);
          sdk.setApiKey(response.data.key);
        }
      } catch (error) {
        handleError(
          error instanceof Error
            ? error
            : new Error("Failed to ensure API key"),
          true
        );
      }
    },
    [sdk, debug, handleError]
  );

  const updateMetadata = useCallback(
    async (metadata: Record<string, any>) => {
      if (!fingerprintId) {
        throw new Error("No fingerprint ID available");
      }

      try {
        log(debug, "Updating fingerprint metadata:", metadata);
        const response = await sdk.updateFingerprint(fingerprintId, {
          metadata,
        });
        if (response.success) {
          log(debug, "Metadata update successful");
          setFingerprint(response.data);
        }
      } catch (error) {
        handleError(
          error instanceof Error
            ? error
            : new Error("Failed to update metadata")
        );
      }
    },
    [fingerprintId, sdk, debug, handleError]
  );

  const initializeFingerprint = useCallback(async () => {
    try {
      setIsLoading(true);
      const visitorId = crypto.randomUUID();
      log(debug, "Initializing fingerprint with visitor ID:", visitorId);

      const response = await sdk.identify({
        fingerprint: visitorId,
        metadata: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          url: window.location.href,
          referrer: document.referrer,
          timestamp: Date.now(),
        },
      });

      if (response.success && response.data) {
        log(debug, "Fingerprint registered successfully:", response.data);
        const id = response.data.id;
        setFingerprintId(id);
        setFingerprint(response.data);
        localStorage.setItem(STORAGE_KEYS.FINGERPRINT_ID, id);

        // Ensure API key is available
        await ensureApiKey(id);

        // Start tracking visit
        log(debug, "Tracking initial visit");
        await sdk.track("visit", {
          fingerprintId: id,
          url: window.location.href,
          referrer: document.referrer,
          timestamp: Date.now(),
        });
        log(debug, "Initial visit tracked successfully");
      }
    } catch (error) {
      handleError(
        error instanceof Error
          ? error
          : new Error("Failed to initialize fingerprint")
      );
    } finally {
      setIsLoading(false);
    }
  }, [sdk, handleError, debug, ensureApiKey]);

  // Initialize fingerprinting
  useEffect(() => {
    const storedFingerprintId = localStorage.getItem(
      STORAGE_KEYS.FINGERPRINT_ID
    );

    if (storedFingerprintId) {
      log(debug, "Found stored fingerprint ID:", storedFingerprintId);
      setFingerprintId(storedFingerprintId);

      // Ensure API key is available
      ensureApiKey(storedFingerprintId);

      sdk
        .getIdentity(storedFingerprintId)
        .then((response) => {
          if (response.success) {
            log(debug, "Retrieved stored fingerprint data:", response.data);
            setFingerprint(response.data);
          } else {
            log(debug, "Stored fingerprint not found, creating new one");
            initializeFingerprint();
          }
        })
        .catch((error) => {
          log(debug, "Error retrieving stored fingerprint:", error);
          initializeFingerprint();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      log(debug, "No stored fingerprint found, creating new one");
      initializeFingerprint();
    }
  }, [sdk, initializeFingerprint, debug, ensureApiKey]);

  // Handle presence tracking
  useEffect(() => {
    if (!fingerprintId) return;

    const trackPresence = async () => {
      try {
        log(debug, "Tracking presence:", {
          fingerprintId,
          status: isOnline ? "online" : "offline",
        });
        await sdk.track("presence", {
          fingerprintId,
          status: isOnline ? "online" : "offline",
          timestamp: Date.now(),
        });
        log(debug, "Presence tracked successfully");
      } catch (error) {
        // Don't show errors for presence tracking failures unless in debug mode
        handleError(
          error instanceof Error
            ? error
            : new Error("Failed to track presence"),
          !debug
        );
      }
    };

    const PRESENCE_INTERVAL = 30000; // 30 seconds
    log(
      debug,
      `Starting presence tracking with ${PRESENCE_INTERVAL}ms interval`
    );
    const interval = setInterval(trackPresence, PRESENCE_INTERVAL);
    trackPresence(); // Initial presence tracking

    return () => {
      log(debug, "Stopping presence tracking");
      clearInterval(interval);
    };
  }, [sdk, fingerprintId, isOnline, debug, handleError]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      log(debug, "Device went online");
      setIsOnline(true);
    };
    const handleOffline = () => {
      log(debug, "Device went offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [debug]);

  const value = {
    sdk,
    isOnline,
    fingerprintId,
    fingerprint,
    isLoading,
    error,
    updateMetadata,
  };

  return (
    <ArgosContext.Provider value={value}>{children}</ArgosContext.Provider>
  );
}

export function useArgosSDK() {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error("useArgosSDK must be used within an ArgosProvider");
  }
  return context.sdk;
}

export function useArgosPresence() {
  const context = useContext(ArgosContext);
  if (!context) {
    throw new Error("useArgosPresence must be used within an ArgosProvider");
  }
  return {
    isOnline: context.isOnline,
    fingerprintId: context.fingerprintId,
    fingerprint: context.fingerprint,
    isLoading: context.isLoading,
    error: context.error,
    updateMetadata: context.updateMetadata,
  };
}
