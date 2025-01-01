import { RequestOptions } from '../../shared/interfaces/http';
import type { RequestInit } from 'node-fetch';

export interface ServerRequestOptions extends RequestOptions {
  // Add any server-specific options from node-fetch
  follow?: number;
  compress?: boolean;
  size?: number;
  agent?: RequestInit['agent'];
  counter?: number;
}
