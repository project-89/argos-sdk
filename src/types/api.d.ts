export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}
export interface ApiError {
  success: false;
  error: string;
  details?: any;
}
export interface ApiSuccess<T> {
  success: true;
  data: T;
}
//# sourceMappingURL=api.d.ts.map
