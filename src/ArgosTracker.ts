import { BaseAPI, BaseAPIConfig } from "./api/BaseAPI";
import { CreateFingerprintRequest } from "./api/FingerprintAPI";
import { FingerprintData } from "./types/api";
import { ApiResponse } from "./types/api";

export class ArgosTracker extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  public async identify(
    request: CreateFingerprintRequest
  ): Promise<ApiResponse<FingerprintData>> {
    return this.fetchApi<FingerprintData>("/fingerprint", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  public async getIdentity(id: string): Promise<ApiResponse<FingerprintData>> {
    return this.fetchApi<FingerprintData>(`/fingerprint/${id}`, {
      method: "GET",
    });
  }

  public async track(
    event: string,
    data: Record<string, any>
  ): Promise<ApiResponse<any>> {
    switch (event) {
      case "visit":
        return this.fetchApi("/visit", {
          method: "POST",
          body: JSON.stringify({
            ...data,
            timestamp: new Date().toISOString(),
          }),
        });
      case "presence":
        return this.fetchApi("/presence", {
          method: "POST",
          body: JSON.stringify(data),
        });
      default:
        throw new Error(`Unknown event type: ${event}`);
    }
  }
}
