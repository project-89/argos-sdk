export const log = (debug: boolean, ...args: any[]) => {
  if (debug) {
    console.log('[Argos]', ...args);
  }
};
