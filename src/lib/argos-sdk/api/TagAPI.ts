import { BaseAPI } from './BaseAPI';
import { ApiResponse } from '../types/api';

export interface TagValue {
  [key: string]: number;
}

export interface TagRule {
  min: number;
  role: string;
}

export interface TagRules {
  [tag: string]: TagRule;
}

export interface TagUpdateResponse {
  fingerprintId: string;
  tags: TagValue;
}

export interface RoleUpdateResponse {
  fingerprintId: string;
  roles: string[];
}

export class TagAPI extends BaseAPI {
  /**
   * Updates tags for a fingerprint
   * @param fingerprintId - The ID of the fingerprint to update tags for
   * @param tags - Object containing tag key-value pairs
   * @returns Promise resolving to the updated tags
   */
  async updateTags(
    fingerprintId: string,
    tags: TagValue
  ): Promise<TagUpdateResponse> {
    try {
      const response = await this.post<TagUpdateResponse>('/tag/update', {
        fingerprintId,
        tags,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update tags');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to update tags: ${error.message}`);
    }
  }

  /**
   * Updates roles based on tag rules
   * @param fingerprintId - The ID of the fingerprint to update roles for
   * @param tagRules - Rules for assigning roles based on tag values
   * @returns Promise resolving to the updated roles
   */
  async updateRolesByTags(
    fingerprintId: string,
    tagRules: TagRules
  ): Promise<RoleUpdateResponse> {
    try {
      const response = await this.post<RoleUpdateResponse>(
        '/tag/roles/update',
        {
          fingerprintId,
          tagRules,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update roles');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to update roles: ${error.message}`);
    }
  }
}
