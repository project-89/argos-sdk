export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export interface CommonResponse {
  ok: boolean;
  status: number;
  headers: {
    get(name: string): string | null;
    forEach(callbackfn: (value: string, key: string) => void): void;
  };
  json(): Promise<any>;
  text(): Promise<string>;
}
