// Critical shims that must be available before any module loads
// This file provides compatibility shims for Node.js modules in browser

// Ensure global exists
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).global === 'undefined') {
  (globalThis as any).global = globalThis;
}

if (typeof window !== 'undefined') {
  (window as any).global = window;
  
  // Process shim
  if (!(window as any).process) {
    (window as any).process = {
      env: {},
      browser: true,
      version: '',
      versions: { node: '' },
      nextTick: (fn: Function, ...args: any[]) => {
        setTimeout(() => fn(...args), 0);
      },
      platform: 'browser',
      cwd: () => '/',
      title: 'browser',
      argv: [],
      pid: 1,
      umask: () => 0,
    };
  }
}

// Export empty object to satisfy TypeScript
export {};
