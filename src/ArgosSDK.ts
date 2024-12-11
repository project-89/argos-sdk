import { BaseAPIConfig } from './api/BaseAPI';
import { FingerprintAPI, CreateFingerprintRequest } from './api/FingerprintAPI';
import { VisitAPI, VisitData, PresenceData } from './api/VisitAPI';
import { RoleAPI } from './api/RoleAPI';
import { APIKeyAPI } from './api/APIKeyAPI';
import { Logger } from './utils/logger';
import { ApiResponse, FingerprintData, RoleData } from './types/api';

export type ArgosEventType = 'visit' | 'presence';

export interface ArgosSDKConfig {
  baseUrl: string;
  apiKey?: string;
  debug?: boolean;
}

export class ArgosSDK {
  private config: ArgosSDKConfig;
  private log: Logger;
  private fingerprintAPI: FingerprintAPI;
  private visitAPI: VisitAPI;
  private roleAPI: RoleAPI;
  private apiKeyAPI: APIKeyAPI;

  constructor(config: ArgosSDKConfig) {
    this.config = config;
    this.log = new Logger(config.debug);

    const apiConfig: BaseAPIConfig = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
    };

    this.fingerprintAPI = new FingerprintAPI(apiConfig);
    this.visitAPI = new VisitAPI(apiConfig);
    this.roleAPI = new RoleAPI(apiConfig);
    this.apiKeyAPI = new APIKeyAPI(apiConfig);

    this.setupEventListeners();
    this.log.info('ArgosSDK initialized');
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.log.info('Connection restored');
      });

      window.addEventListener('offline', () => {
        this.log.warn('Connection lost');
      });
    }
  }

  /**
   * Public Methods - No API Key Required
   */

  public async identify(
    request: CreateFingerprintRequest
  ): Promise<ApiResponse<FingerprintData>> {
    this.log.info('Identifying user', request);
    return this.fingerprintAPI.createFingerprint(request);
  }

  public async getIdentity(id: string): Promise<ApiResponse<FingerprintData>> {
    return this.fingerprintAPI.getFingerprint(id);
  }

  public async track(
    event: ArgosEventType,
    data: Omit<VisitData, 'id'> | PresenceData
  ): Promise<ApiResponse<void>> {
    this.log.info(`Tracking event: ${event}`, data);

    switch (event) {
      case 'visit':
        return this.visitAPI.createVisit(data as Omit<VisitData, 'id'>);
      case 'presence':
        return this.visitAPI.updatePresence(data as PresenceData);
      default:
        throw new Error(`Unknown event type: ${event}`);
    }
  }

  /**
   * Protected Methods - Require API Key
   */

  public async validateAPIKey(apiKey: string): Promise<ApiResponse<boolean>> {
    if (!this.config.apiKey) {
      throw new Error('API key required for this operation');
    }
    return this.apiKeyAPI.validateAPIKey(apiKey);
  }

  public async getRoles(fingerprintId: string): Promise<ApiResponse<RoleData>> {
    if (!this.config.apiKey) {
      throw new Error('API key required for this operation');
    }
    return this.roleAPI.getRoles(fingerprintId);
  }

  public async addRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    if (!this.config.apiKey) {
      throw new Error('API key required for this operation');
    }
    return this.roleAPI.addRoles(fingerprintId, roles);
  }

  public async removeRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    if (!this.config.apiKey) {
      throw new Error('API key required for this operation');
    }
    return this.roleAPI.removeRoles(fingerprintId, roles);
  }

  /**
   * Utility Methods
   */

  public isOnline(): boolean {
    return typeof window !== 'undefined' ? navigator.onLine : true;
  }
}
