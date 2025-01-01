import type {
  Response as NodeResponse,
  RequestInit as NodeRequestInit,
} from 'node-fetch';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export type CommonResponse = Response | NodeResponse;
export type CommonRequestInit = RequestInit | NodeRequestInit;

// Shared request options that work in both environments
export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  timeout?: number;
}
