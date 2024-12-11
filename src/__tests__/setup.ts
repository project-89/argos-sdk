import { FingerprintData, RoleData } from '../types/api';

// Mock data
export const mockFingerprintData: FingerprintData = {
  id: 'test-id',
  userAgent: 'test-agent',
  ip: '127.0.0.1',
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockRoleData: RoleData = {
  fingerprintId: 'test-id',
  roles: [],
  timestamp: new Date().toISOString(),
};
