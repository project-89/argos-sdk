import type {
  Response as NodeResponse,
  RequestInit as NodeRequestInit,
} from 'node-fetch';
import { BaseAPIConfig } from '../../shared/api/BaseAPI';
import {
  ApiResponse,
  Fingerprint,
  ImpressionData,
  CreateImpressionRequest,
  CreateAPIKeyRequest,
  DeleteImpressionsResponse,
  ValidateAPIKeyResponse,
  APIKeyData,
} from '../../shared/interfaces/api';
import { FingerprintAPI } from '../../shared/api/FingerprintAPI';
import { APIKeyAPI } from '../../shared/api/APIKeyAPI';
import { ImpressionAPI } from '../../shared/api/ImpressionAPI';
import { EnvironmentFactory } from '../../core/factory/EnvironmentFactory';
import { EnvironmentInterface } from '../../shared/interfaces/environment';

export interface ServerSDKConfig
  extends Omit<BaseAPIConfig<NodeResponse, NodeRequestInit>, 'environment'> {
  debug?: boolean;
  environment?: EnvironmentInterface<NodeResponse, NodeRequestInit>;
  encryptionKey?: string;
}

export class ArgosServerSDK {
  private config: ServerSDKConfig;
  private environment: EnvironmentInterface<NodeResponse, NodeRequestInit>;
  private fingerprintAPI: FingerprintAPI<NodeResponse, NodeRequestInit>;
  private apiKeyAPI: APIKeyAPI<NodeResponse, NodeRequestInit>;
  private impressionAPI: ImpressionAPI<NodeResponse, NodeRequestInit>;

  constructor(config: ServerSDKConfig) {
    this.config = config;

    // Initialize environment
    this.environment =
      config.environment ||
      EnvironmentFactory.createNodeEnvironment(config.encryptionKey || '');

    if (config.apiKey) {
      this.environment.setApiKey(config.apiKey);
    }

    const apiConfig: BaseAPIConfig<NodeResponse, NodeRequestInit> = {
      ...config,
      environment: this.environment,
    };

    // Initialize APIs
    this.fingerprintAPI = new FingerprintAPI(apiConfig);
    this.apiKeyAPI = new APIKeyAPI(apiConfig);
    this.impressionAPI = new ImpressionAPI(apiConfig);
  }

  async track(
    type: string,
    options: {
      fingerprintId: string;
      status?: 'online' | 'offline';
      url?: string;
      title?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<ApiResponse<ImpressionData>> {
    return this.impressionAPI.createImpression({
      type,
      fingerprintId: options.fingerprintId,
      data: {
        status: options.status,
        url: options.url,
        title: options.title,
        ...options.metadata,
      },
    });
  }

  async createImpression(
    request: CreateImpressionRequest
  ): Promise<ApiResponse<ImpressionData>> {
    return this.impressionAPI.createImpression(request);
  }

  async createAPIKey(
    request: CreateAPIKeyRequest
  ): Promise<ApiResponse<{ key: string }>> {
    return this.apiKeyAPI.createAPIKey(request);
  }

  async validateAPIKey(
    key: string
  ): Promise<ApiResponse<ValidateAPIKeyResponse>> {
    return this.apiKeyAPI.validateAPIKey(key);
  }

  async revokeAPIKey(request: {
    key: string;
  }): Promise<ApiResponse<{ success: boolean }>> {
    const response = await this.apiKeyAPI.revokeAPIKey(request);
    return {
      success: response.success,
      data: { success: response.success },
    };
  }

  async identify(data: {
    fingerprint: string;
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.createFingerprint(data.fingerprint, {
      metadata: data.metadata,
    });
  }

  async updateFingerprint(
    fingerprintId: string,
    metadata: Record<string, unknown>
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.updateFingerprint(fingerprintId, metadata);
  }

  async getIdentity(id: string): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.getFingerprint(id);
  }

  async registerApiKey(
    fingerprintId: string,
    metadata?: Record<string, unknown>
  ): Promise<ApiResponse<APIKeyData>> {
    const request: CreateAPIKeyRequest = {
      name: `server-sdk-${fingerprintId}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      metadata: { fingerprintId, ...metadata },
    };

    return this.apiKeyAPI.createAPIKey(request);
  }

  setApiKey(apiKey: string): void {
    this.environment.setApiKey(apiKey);
  }

  getApiKey(): string | undefined {
    return this.environment.getApiKey();
  }

  async deleteImpressions(
    fingerprintId: string,
    type?: string
  ): Promise<ApiResponse<DeleteImpressionsResponse>> {
    return this.impressionAPI.deleteImpressions(fingerprintId, type);
  }
}
