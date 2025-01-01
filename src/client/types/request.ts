import { RequestOptions } from '../../shared/interfaces/http';

export interface BrowserRequestOptions extends RequestOptions {
  cache?: RequestCache;
  credentials?: RequestCredentials;
  integrity?: string;
  keepalive?: boolean;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  window?: null;
}
