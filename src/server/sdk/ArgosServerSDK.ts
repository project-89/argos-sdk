import { BaseAPIConfig } from '../../shared/api/BaseAPI';
import {
  ApiResponse,
  Fingerprint,
  PresenceData,
  VisitData,
  RoleData,
  TagData,
  PriceData,
  PriceHistoryData,
  SystemHealthData,
  GetCurrentPricesOptions,
  GetPriceHistoryOptions,
  GetVisitHistoryOptions,
  CreateAPIKeyRequest,
  RevokeAPIKeyRequest,
  APIKeyData,
  UpdateAPIKeyRequest,
  CreateImpressionRequest,
  GetImpressionsOptions,
  ImpressionData,
  DeleteImpressionsResponse,
  CreateFingerprintRequest,
  CreateVisitRequest,
  UpdatePresenceRequest,
  UpdateTagsRequest,
} from '../../shared/interfaces/api';
import { FingerprintAPI } from '../../shared/api/FingerprintAPI';
import { VisitAPI } from '../../shared/api/VisitAPI';
import { RoleAPI } from '../../shared/api/RoleAPI';
import { TagAPI } from '../../shared/api/TagAPI';
import { PriceAPI } from '../../shared/api/PriceAPI';
import { SystemAPI } from '../../shared/api/SystemAPI';
import { APIKeyAPI } from '../../shared/api/APIKeyAPI';
import { ImpressionAPI } from '../../shared/api/ImpressionAPI';

export type TrackEventType = 'visit' | 'presence' | 'custom';

export interface ServerSDKConfig extends BaseAPIConfig {
  apiKey?: string;
  defaultFingerprint?: string;
  debug?: boolean;
}

export class ArgosServerSDK {
  private config: ServerSDKConfig;
  private fingerprintAPI: FingerprintAPI;
  private visitAPI: VisitAPI;
  private roleAPI: RoleAPI;
  private tagAPI: TagAPI;
  private priceAPI: PriceAPI;
  private systemAPI: SystemAPI;
  private apiKeyAPI: APIKeyAPI;
  private impressionAPI: ImpressionAPI;

  constructor(config: ServerSDKConfig) {
    this.config = config;
    this.fingerprintAPI = new FingerprintAPI(config);
    this.visitAPI = new VisitAPI(config);
    this.roleAPI = new RoleAPI(config);
    this.tagAPI = new TagAPI(config);
    this.priceAPI = new PriceAPI(config);
    this.systemAPI = new SystemAPI(config);
    this.apiKeyAPI = new APIKeyAPI(config);
    this.impressionAPI = new ImpressionAPI(config);
  }

  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  async getApiKeyData(id: string): Promise<ApiResponse<APIKeyData>> {
    return this.apiKeyAPI.getAPIKey(id);
  }

  async identify(
    request: CreateFingerprintRequest
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.createFingerprint(request.fingerprint, {
      metadata: request.metadata || {},
    });
  }

  async getCurrentPrices(
    options?: GetCurrentPricesOptions
  ): Promise<ApiResponse<PriceData>> {
    return this.priceAPI.getCurrentPrices({
      tokens: options?.tokens || [],
    });
  }

  async getPriceHistory(
    token: string,
    options?: GetPriceHistoryOptions
  ): Promise<ApiResponse<PriceHistoryData>> {
    return this.priceAPI.getPriceHistory(token, {
      interval: options?.interval || '24h',
      limit: options?.limit,
    });
  }

  // Identity Management
  async getIdentity(id: string): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.getFingerprint(id);
  }

  async updateFingerprint(
    fingerprintId: string,
    metadata: Record<string, unknown>
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.updateFingerprint(fingerprintId, metadata);
  }

  // Role Management
  async listAvailableRoles(): Promise<ApiResponse<string[]>> {
    return this.roleAPI.listAvailableRoles();
  }

  async getRoles(fingerprintId: string): Promise<ApiResponse<RoleData>> {
    return this.roleAPI.getRoles(fingerprintId);
  }

  async addRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    return this.roleAPI.addRoles(fingerprintId, roles);
  }

  async removeRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    return this.roleAPI.removeRoles(fingerprintId, roles);
  }

  // Tag Management
  async updateTags(
    fingerprintId: string,
    request: UpdateTagsRequest
  ): Promise<ApiResponse<TagData>> {
    return this.tagAPI.updateTags(fingerprintId, request);
  }

  async getTags(fingerprintId: string): Promise<ApiResponse<TagData>> {
    return this.tagAPI.getTags(fingerprintId);
  }

  async deleteTags(fingerprintId: string): Promise<void> {
    return this.tagAPI.deleteTags(fingerprintId);
  }

  // API Key Management
  async registerApiKey(
    fingerprintId: string,
    metadata?: Record<string, unknown>
  ): Promise<ApiResponse<APIKeyData>> {
    try {
      const response = await this.apiKeyAPI.registerInitialApiKey(
        fingerprintId,
        metadata || {}
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to register API key: ${message}`);
    }
  }

  async createApiKey(
    request: CreateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    return this.apiKeyAPI.createAPIKey(request);
  }

  async validateApiKey(apiKey: string): Promise<ApiResponse<boolean>> {
    return this.apiKeyAPI.validateAPIKey(apiKey);
  }

  async revokeApiKey(request: RevokeAPIKeyRequest): Promise<ApiResponse<void>> {
    return this.apiKeyAPI.revokeAPIKey(request);
  }

  async listApiKeys(): Promise<ApiResponse<APIKeyData[]>> {
    return this.apiKeyAPI.listAPIKeys();
  }

  async updateApiKey(
    id: string,
    request: UpdateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    return this.apiKeyAPI.updateAPIKey(id, request);
  }

  async deleteApiKey(id: string): Promise<ApiResponse<boolean>> {
    return this.apiKeyAPI.deleteAPIKey(id);
  }

  // Visit Tracking
  public async track(
    event: 'visit',
    data: Omit<CreateVisitRequest, 'timestamp' | 'type'>
  ): Promise<ApiResponse<VisitData>>;
  public async track(
    event: 'presence',
    data: Omit<UpdatePresenceRequest, 'timestamp'>
  ): Promise<ApiResponse<PresenceData>>;
  public async track(
    event: 'custom',
    data: Omit<CreateVisitRequest, 'timestamp' | 'type'>
  ): Promise<ApiResponse<VisitData>>;
  public async track(
    event: TrackEventType,
    data: Omit<CreateVisitRequest | UpdatePresenceRequest, 'timestamp'>
  ): Promise<ApiResponse<VisitData | PresenceData>> {
    try {
      if (this.config.debug) {
        console.log('[Argos Server] Tracking event:', event, data);
      }

      const timestamp = new Date().toISOString();

      switch (event) {
        case 'visit': {
          const visitData = {
            ...data,
            timestamp,
            type: 'visit',
          } as CreateVisitRequest;
          return await this.visitAPI.createVisit(visitData);
        }
        case 'presence': {
          const presenceData = {
            ...data,
            timestamp,
          } as UpdatePresenceRequest;
          return await this.visitAPI.updatePresence(presenceData);
        }
        case 'custom': {
          const customData = {
            ...data,
            type: 'custom',
            timestamp,
          } as CreateVisitRequest;
          return await this.visitAPI.createVisit(customData);
        }
        default:
          throw new Error(`Unknown event type: ${event}`);
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('[Argos Server] Error:', error);
      }
      throw error;
    }
  }

  /**
   * Visit tracking methods
   */
  async getVisitHistory(
    fingerprintId: string,
    options?: GetVisitHistoryOptions
  ): Promise<ApiResponse<{ visits: VisitData[] }>> {
    return this.visitAPI.getVisitHistory(fingerprintId, options);
  }

  // System Health
  async checkHealth(): Promise<ApiResponse<SystemHealthData>> {
    return this.systemAPI.checkHealth();
  }

  // Impression Management
  async createImpression(
    request: CreateImpressionRequest
  ): Promise<ApiResponse<ImpressionData>> {
    return this.impressionAPI.createImpression(request);
  }

  async getImpressions(
    fingerprintId: string,
    options?: GetImpressionsOptions
  ): Promise<ApiResponse<ImpressionData[]>> {
    return this.impressionAPI.getImpressions(fingerprintId, options);
  }

  async deleteImpressions(
    fingerprintId: string,
    options?: GetImpressionsOptions
  ): Promise<ApiResponse<DeleteImpressionsResponse>> {
    return this.impressionAPI.deleteImpressions(fingerprintId, options);
  }

  // API Key Management
  async registerInitialApiKey(
    fingerprintId: string,
    metadata: Record<string, unknown>
  ): Promise<ApiResponse<APIKeyData>> {
    return this.apiKeyAPI.registerInitialApiKey(fingerprintId, metadata);
  }

  async getPlatformInfo(): Promise<Record<string, unknown>> {
    return {
      type: 'server',
      nodeVersion: process.version,
      arch: process.arch,
      platform: process.platform,
    };
  }
}
