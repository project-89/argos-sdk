import { BrowserRequestOptions } from '../types/request';

export async function clientFetch(
  url: string,
  options: BrowserRequestOptions = {}
) {
  const { timeout, ...fetchOptions } = options;

  const controller = new AbortController();
  if (timeout) {
    setTimeout(() => controller.abort(), timeout);
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
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
