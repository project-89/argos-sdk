export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type EndpointConfig = {
  path: string | RegExp;
  methods: HttpMethod[];
};

// List of endpoints that don't require API key authentication
export const PUBLIC_ENDPOINTS: EndpointConfig[] = [
  // Fingerprint endpoints
  { path: '/fingerprint', methods: ['POST'] },
  { path: /^\/fingerprint\/[^/]+$/, methods: ['GET'] },

  // Role endpoints
  { path: '/roles', methods: ['GET'] },

  // API Key endpoints
  { path: '/api-key/validate', methods: ['POST'] },

  // Basic tracking endpoints
  { path: '/visit', methods: ['POST'] },
  { path: '/presence', methods: ['POST'] },
];

// Helper function to check if an endpoint is public
export function isPublicEndpoint(
  endpoint: string,
  method: HttpMethod
): boolean {
  return PUBLIC_ENDPOINTS.some((config) => {
    // Check if the path matches (either string equality or regex test)
    const pathMatches =
      config.path instanceof RegExp
        ? config.path.test(endpoint)
        : endpoint === config.path;

    // Check if the method is allowed
    const methodMatches = config.methods.includes(method);

    return pathMatches && methodMatches;
  });
}
