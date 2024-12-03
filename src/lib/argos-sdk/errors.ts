/**
 * Custom error class for SDK-specific errors
 */
export class ArgosError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'ArgosError';
    Object.setPrototypeOf(this, ArgosError.prototype);
  }
}
