export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type EndpointConfig = {
  path: string | RegExp;
  methods: HttpMethod[];
};

// List of endpoints that don't require API key authentication
export const PUBLIC_ENDPOINTS: EndpointConfig[] = [
  // Fingerprint endpoints
  { path: '/fingerprint/register', methods: ['POST'] },
  { path: /^\/fingerprint\/[^/]+$/, methods: ['GET'] },

  // Visit endpoints
  { path: '/visit/log', methods: ['POST'] },
  { path: '/visit/presence', methods: ['POST'] },

  // API Key endpoints
  { path: '/apiKey/validate', methods: ['POST'] },
];

// Helper function to check if an endpoint is public
export function isPublicEndpoint(
  endpoint: string,
  method: HttpMethod
): boolean {
  const matchingEndpoint = PUBLIC_ENDPOINTS.find((config) => {
    // Check if the path matches (either string equality or regex test)
    return config.path instanceof RegExp
      ? config.path.test(endpoint)
      : endpoint === config.path;
  });

  // If no matching endpoint is found, or the method is not allowed, return false
  return matchingEndpoint ? matchingEndpoint.methods.includes(method) : false;
}
