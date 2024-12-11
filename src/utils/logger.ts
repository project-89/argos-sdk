export class Logger {
  private debug: boolean;

  constructor(debug = false) {
    this.debug = debug;
  }

  public info(message: string, ...args: any[]) {
    if (this.debug) {
      console.info(`[Argos] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: any[]) {
    if (this.debug) {
      console.warn(`[Argos] ${message}`, ...args);
    }
  }

  public error(message: string, ...args: any[]) {
    if (this.debug) {
      console.error(`[Argos] ${message}`, ...args);
    }
  }
}
