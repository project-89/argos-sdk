import { HttpMethod } from '../interfaces/http';

interface Endpoint {
  path: string;
  method: HttpMethod;
}

interface PublicEndpoint {
  path: string;
  methods: HttpMethod[];
}

export const endpoints: Record<string, Endpoint> = {
  validateAPIKey: {
    path: '/api-key/validate',
    method: HttpMethod.POST,
  },
  getFingerprint: {
    path: '/fingerprint',
    method: HttpMethod.GET,
  },
  getVisitHistory: {
    path: '/visit/history',
    method: HttpMethod.GET,
  },
  createVisit: {
    path: '/visit/log',
    method: HttpMethod.POST,
  },
  updatePresence: {
    path: '/visit/presence',
    method: HttpMethod.POST,
  },
};

export const PUBLIC_ENDPOINTS: PublicEndpoint[] = [
  { path: '/fingerprint/register', methods: [HttpMethod.POST] },
  { path: '/fingerprint', methods: [HttpMethod.GET] },
  { path: '/roles', methods: [HttpMethod.GET] },
  { path: '/api-key/validate', methods: [HttpMethod.POST] },
  { path: '/api-key/register', methods: [HttpMethod.POST] },
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
    method === HttpMethod.GET &&
    path.startsWith('/fingerprint/') &&
    path !== '/fingerprint/register'
  ) {
    return true;
  }

  return false;
};
