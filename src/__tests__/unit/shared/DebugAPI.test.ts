import { DebugAPI } from '../../../shared/api/DebugAPI';
import { createMockEnvironment } from '../../../__tests__/utils/testUtils';

describe('DebugAPI', () => {
  let debugAPI: DebugAPI;

  beforeEach(() => {
    debugAPI = new DebugAPI({
      baseUrl: 'https://test.example.com',
      environment: createMockEnvironment(),
    });
  });

  describe('getDebugInfo', () => {
    it('should get debug info successfully', async () => {
      const response = await debugAPI.getDebugInfo();
      expect(response.success).toBe(true);
    });
  });
});
