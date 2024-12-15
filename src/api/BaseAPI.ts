import { ApiResponse } from "../types/api";

export interface BaseAPIConfig {
  baseUrl: string;
  apiKey?: string;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS";

export class BaseAPI {
  protected baseUrl: string;
  protected apiKey?: string;

  constructor(config: BaseAPIConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  protected async fetchApi<T>(
    endpoint: string,
    options: RequestInit & { isPublic?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = (options.method || "GET") as HttpMethod;
    const isPublic = options.isPublic || false;

    // Create headers object with proper typing
    const baseHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: window.location.origin,
    };

    // Only add API key for non-public endpoints
    if (this.apiKey && !isPublic) {
      baseHeaders["X-API-Key"] = this.apiKey;
    }

    // Merge with provided headers
    const headers = {
      ...baseHeaders,
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors",
        credentials: "same-origin",
        cache: "no-cache",
        referrerPolicy: "strict-origin-when-cross-origin",
      });

      if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        let errorDetails = {};

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          errorDetails = errorData;
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }

        console.error("[Argos] Request failed:", {
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          details: errorDetails,
        });

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      if (error instanceof Error) {
        // Enhanced error handling for CORS and connection issues
        if (error.message.includes("Failed to fetch")) {
          throw new Error(
            `Unable to connect to Argos API at ${url}. ` +
              "Please ensure the server is running and CORS is properly configured."
          );
        }
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  }
}
