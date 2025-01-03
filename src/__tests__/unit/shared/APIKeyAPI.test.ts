import { APIKeyAPI } from '../../../shared/api/APIKeyAPI';
import {
  CommonResponse,
  CommonRequestInit,
} from '../../../shared/interfaces/http';
import {
  EnvironmentInterface,
  RuntimeEnvironment,
} from '../../../shared/interfaces/environment';

// Mock environment
const mockEnvironment: jest.Mocked<
  EnvironmentInterface<CommonResponse, CommonRequestInit>
> = {
  type: RuntimeEnvironment.Node,
  createHeaders: jest.fn(),
  getApiKey: jest.fn(),
  setApiKey: jest.fn(),
  getFingerprint: jest.fn(),
  fetch: jest.fn(),
  handleResponse: jest.fn(),
  getPlatformInfo: jest.fn(),
  getUserAgent: jest.fn(),
  isOnline: jest.fn(),
};

// Valid test values
const VALID_TEST_KEY = 'dGVzdC1hcGkta2V5LXZhbGlkLWZvcm1hdA=='; // base64 encoded
const TEST_FINGERPRINT_ID = 'test-fingerprint-id';

describe('APIKeyAPI', () => {
  let api: APIKeyAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    api = new APIKeyAPI({
      baseUrl: 'http://localhost',
      environment: mockEnvironment,
    });

    // Default mock implementation for handleResponse
    mockEnvironment.handleResponse.mockImplementation(async (response) => {
      const jsonData = await response.json();
      return jsonData;
    });
  });

  describe('createAPIKey', () => {
    it('should create API key and store fingerprint ID', async () => {
      const mockResponse = {
        success: true,
        data: {
          key: VALID_TEST_KEY,
          fingerprintId: TEST_FINGERPRINT_ID,
        },
        error: undefined,
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as CommonResponse);

      const response = await api.createAPIKey({
        name: 'test-key',
        fingerprintId: TEST_FINGERPRINT_ID,
      });

      expect(response).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        success: false,
        data: null,
        error: 'API Key creation failed',
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as CommonResponse);

      await expect(
        api.createAPIKey({
          name: 'test-key',
          fingerprintId: TEST_FINGERPRINT_ID,
        })
      ).rejects.toThrow('API Key creation failed');
    });
  });

  describe('validateAPIKey', () => {
    it('should validate API key', async () => {
      const mockResponse = {
        success: true,
        data: {
          valid: true,
          needsRefresh: false,
        },
        error: undefined,
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as CommonResponse);

      const response = await api.validateAPIKey(VALID_TEST_KEY);
      expect(response).toEqual(mockResponse);
    });

    it('should handle validation with refresh needed', async () => {
      const mockResponse = {
        success: true,
        data: {
          valid: false,
          needsRefresh: true,
        },
        error: undefined,
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as CommonResponse);

      const response = await api.validateAPIKey(VALID_TEST_KEY);
      expect(response).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        success: false,
        data: null,
        error: 'Failed to validate API key',
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as CommonResponse);

      await expect(api.validateAPIKey(VALID_TEST_KEY)).rejects.toThrow(
        'Failed to validate API key'
      );
    });
  });

  describe('refreshAPIKey', () => {
    it('should refresh API key using stored fingerprint ID', async () => {
      // First create an API key to store the fingerprint ID
      const createResponse = {
        success: true,
        data: {
          key: VALID_TEST_KEY,
          fingerprintId: TEST_FINGERPRINT_ID,
        },
        error: undefined,
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(createResponse),
      } as CommonResponse);

      await api.createAPIKey({
        name: 'test-key',
        fingerprintId: TEST_FINGERPRINT_ID,
      });

      // Mock validation response
      const validationResponse = {
        success: true,
        data: {
          valid: true,
          needsRefresh: false,
        },
        error: undefined,
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(validationResponse),
      } as CommonResponse);

      // Mock refresh response
      const refreshResponse = {
        success: true,
        data: {
          key: VALID_TEST_KEY,
          fingerprintId: TEST_FINGERPRINT_ID,
        },
        error: undefined,
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(refreshResponse),
      } as CommonResponse);

      const response = await api.refreshAPIKey(VALID_TEST_KEY);
      expect(response).toEqual(refreshResponse);
    });

    it('should fail to refresh if no fingerprint ID is stored', async () => {
      // Mock validation response
      const validationResponse = {
        success: true,
        data: {
          valid: true,
          needsRefresh: false,
        },
        error: undefined,
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(validationResponse),
      } as CommonResponse);

      await expect(api.refreshAPIKey(VALID_TEST_KEY)).rejects.toThrow(
        'No fingerprint ID available. Please create a new API key.'
      );
    });
  });

  describe('rotateAPIKey', () => {
    it('should rotate API key using stored fingerprint ID', async () => {
      // First create an API key to store the fingerprint ID
      const createResponse = {
        success: true,
        data: {
          key: VALID_TEST_KEY,
          fingerprintId: TEST_FINGERPRINT_ID,
        },
        error: undefined,
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(createResponse),
      } as CommonResponse);

      await api.createAPIKey({
        name: 'test-key',
        fingerprintId: TEST_FINGERPRINT_ID,
      });

      // Mock validation response
      const validationResponse = {
        success: true,
        data: {
          valid: true,
          needsRefresh: false,
        },
        error: undefined,
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(validationResponse),
      } as CommonResponse);

      // Mock rotation response
      const rotateResponse = {
        success: true,
        data: {
          key: VALID_TEST_KEY,
          fingerprintId: TEST_FINGERPRINT_ID,
        },
        error: undefined,
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(rotateResponse),
      } as CommonResponse);

      const response = await api.rotateAPIKey(VALID_TEST_KEY);
      expect(response).toEqual(rotateResponse);
    });

    it('should fail to rotate if no fingerprint ID is stored', async () => {
      // Mock validation response
      const validationResponse = {
        success: true,
        data: {
          valid: true,
          needsRefresh: false,
        },
        error: undefined,
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(validationResponse),
      } as CommonResponse);

      await expect(api.rotateAPIKey(VALID_TEST_KEY)).rejects.toThrow(
        'No fingerprint ID available. Please create a new API key.'
      );
    });
  });

  describe('revokeAPIKey', () => {
    it('should revoke API key', async () => {
      const mockResponse = {
        success: true,
        data: null,
        error: undefined,
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as CommonResponse);

      await api.revokeAPIKey({ key: VALID_TEST_KEY });
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        success: false,
        data: null,
        error: 'Failed to revoke API key',
      };

      mockEnvironment.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as CommonResponse);

      await expect(api.revokeAPIKey({ key: VALID_TEST_KEY })).rejects.toThrow(
        'Failed to revoke API key'
      );
    });
  });

  describe('API Key Format Validation', () => {
    it('should reject empty API keys', () => {
      expect(() => api['validateKeyFormat']('')).toThrow();
    });

    it('should reject invalid API key formats', () => {
      expect(() => api['validateKeyFormat']('invalid-key')).toThrow();
    });

    it('should accept valid API key formats', () => {
      expect(() => api['validateKeyFormat'](VALID_TEST_KEY)).not.toThrow();
    });
  });
});
