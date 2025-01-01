import nodeFetch, { RequestInit } from 'node-fetch';
import { ServerRequestOptions } from '../types/request';

export async function serverFetch(
  url: string,
  options: ServerRequestOptions = {}
) {
  const { timeout, ...fetchOptions } = options;

  const controller = new AbortController();
  if (timeout) {
    setTimeout(() => controller.abort(), timeout);
  }

  try {
    const response = await nodeFetch(url, {
      ...fetchOptions,
      signal: controller.signal as RequestInit['signal'],
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
}
