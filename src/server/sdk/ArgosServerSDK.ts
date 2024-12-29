import type { Response as NodeResponse } from 'node-fetch';
import { BaseAPIConfig } from '../../shared/api/BaseAPI';
import type { EnvironmentInterface } from '../../shared/interfaces/environment';
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
  ValidateAPIKeyResponse,
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

export interface ServerSDKConfig extends BaseAPIConfig<NodeResponse> {
  apiKey?: string;
  defaultFingerprint?: string;
  debug?: boolean;
}

export class ArgosServerSDK {
  private config: ServerSDKConfig;
  private fingerprintAPI: FingerprintAPI<NodeResponse>;
  private visitAPI: VisitAPI<NodeResponse>;
  private roleAPI: RoleAPI<NodeResponse>;
  private tagAPI: TagAPI<NodeResponse>;
  private priceAPI: PriceAPI<NodeResponse>;
  private systemAPI: SystemAPI<NodeResponse>;
  private apiKeyAPI: APIKeyAPI<NodeResponse>;
  private impressionAPI: ImpressionAPI<NodeResponse>;

  constructor(config: ServerSDKConfig) {
    this.config = config;
    this.fingerprintAPI = new FingerprintAPI<NodeResponse>(config);
    this.visitAPI = new VisitAPI<NodeResponse>(config);
    this.roleAPI = new RoleAPI<NodeResponse>(config);
    this.tagAPI = new TagAPI<NodeResponse>(config);
    this.priceAPI = new PriceAPI<NodeResponse>(config);
    this.systemAPI = new SystemAPI<NodeResponse>(config);
    this.apiKeyAPI = new APIKeyAPI<NodeResponse>(config);
    this.impressionAPI = new ImpressionAPI<NodeResponse>(config);
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

  async addRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    return this.roleAPI.addRoles(fingerprintId, roles);
  }

  async getRoles(fingerprintId: string): Promise<ApiResponse<RoleData>> {
    return this.roleAPI.getRoles(fingerprintId);
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

  // Visit Management
  async createVisit(
    request: CreateVisitRequest
  ): Promise<ApiResponse<VisitData>> {
    return this.visitAPI.createVisit(request);
  }

  async getVisit(id: string): Promise<ApiResponse<VisitData>> {
    return this.visitAPI.getVisit(id);
  }

  async updatePresence(
    presenceData: UpdatePresenceRequest
  ): Promise<ApiResponse<PresenceData>> {
    return this.visitAPI.updatePresence(presenceData);
  }

  async getVisitHistory(
    fingerprintId: string,
    options?: GetVisitHistoryOptions
  ): Promise<ApiResponse<{ visits: VisitData[] }>> {
    return this.visitAPI.getVisitHistory(fingerprintId, options);
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

  async createApiKey(
    request: CreateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    return this.apiKeyAPI.createAPIKey(request);
  }

  async validateApiKey(
    apiKey: string
  ): Promise<ApiResponse<ValidateAPIKeyResponse>> {
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

  // System Health
  async checkHealth(): Promise<ApiResponse<SystemHealthData>> {
    return this.systemAPI.checkHealth();
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
