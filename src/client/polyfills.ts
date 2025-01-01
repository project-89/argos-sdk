// Ensure global is available in browser environments
if (typeof window !== 'undefined') {
  (window as any).global = window;
}
