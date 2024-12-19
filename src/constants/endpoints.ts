import { HttpMethod } from '../api/BaseAPI';

interface Endpoint {
  path: string;
  methods: HttpMethod[];
}

export const PUBLIC_ENDPOINTS: Endpoint[] = [
  { path: '/fingerprint/register', methods: ['POST'] },
  { path: '/fingerprint', methods: ['GET'] },
  { path: '/roles', methods: ['GET'] },
  { path: '/api-key/validate', methods: ['POST'] },
  { path: '/api-key/register', methods: ['POST'] },
];

export const isPublicEndpoint = (path: string, method: HttpMethod): boolean => {
  // First check for exact matches
  const exactMatch = PUBLIC_ENDPOINTS.find(
    (endpoint) => endpoint.path === path && endpoint.methods.includes(method)
  );
  if (exactMatch) {
    return true;
  }

  // Then check for /fingerprint/* GET requests, excluding /fingerprint/register
  if (
    method === 'GET' &&
    path.startsWith('/fingerprint/') &&
    path !== '/fingerprint/register'
  ) {
    return true;
  }

  return false;
};
