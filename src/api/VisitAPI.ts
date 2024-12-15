import { BaseAPI, BaseAPIConfig } from "./BaseAPI";
import { ApiResponse } from "../types/api";

export interface VisitData {
  fingerprintId: string;
  url: string;
  referrer?: string;
  timestamp: number;
}

export interface PresenceData {
  fingerprintId: string;
  status: "online" | "offline";
  timestamp: number;
}

export interface RemoveSiteRequest {
  fingerprintId: string;
  url: string;
}

export class VisitAPI extends BaseAPI {
  constructor(config: BaseAPIConfig) {
    super(config);
  }

  /**
   * Log a visit
   */
  public async createVisit(data: VisitData): Promise<ApiResponse<void>> {
    try {
      return await this.fetchApi("/visit/log", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to log visit: ${message}`);
    }
  }

  /**
   * Update presence status
   */
  public async updatePresence(data: PresenceData): Promise<ApiResponse<void>> {
    try {
      return await this.fetchApi("/visit/presence", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update presence: ${message}`);
    }
  }

  /**
   * Get presence status
   */
  public async getPresence(
    fingerprintId: string
  ): Promise<ApiResponse<PresenceData>> {
    try {
      return await this.fetchApi(`/visit/presence/${fingerprintId}`, {
        method: "GET",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get presence: ${message}`);
    }
  }

  /**
   * Remove site from visit history
   */
  public async removeSite(data: RemoveSiteRequest): Promise<ApiResponse<void>> {
    try {
      return await this.fetchApi("/visit/site/remove", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to remove site: ${message}`);
    }
  }

  /**
   * Get visit history
   */
  public async getHistory(
    fingerprintId: string
  ): Promise<ApiResponse<VisitData[]>> {
    try {
      return await this.fetchApi(`/visit/history/${fingerprintId}`, {
        method: "GET",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get visit history: ${message}`);
    }
  }
}
