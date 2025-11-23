// Polyfills for Node.js modules in browser environment
// Must be imported first in main.tsx

// Buffer polyfill
import { Buffer as BufferPolyfill } from 'buffer/';

// EventEmitter polyfill
import EventEmitterImpl from 'eventemitter3';

// Setup global environment
if (typeof window !== 'undefined') {
  // Buffer
  (window as any).Buffer = BufferPolyfill;
  if (!(globalThis as any).Buffer) {
    (globalThis as any).Buffer = BufferPolyfill;
  }
  
  // Global reference
  (window as any).global = window;
  if (!globalThis.global) {
    (globalThis as any).global = globalThis;
  }
  
  // Process polyfill
  if (!(window as any).process) {
    (window as any).process = {
      env: {},
      browser: true,
      nextTick: (fn: Function, ...args: any[]) => setTimeout(() => fn(...args), 0),
      version: '',
      versions: { node: '' },
      platform: 'browser',
      cwd: () => '/',
    };
  }
  
  // EventEmitter
  if (!(window as any).EventEmitter) {
    (window as any).EventEmitter = EventEmitterImpl;
  }
  
  // Export EventEmitter to module scope
  if (typeof module !== 'undefined' && module.exports) {
    (module as any).exports = EventEmitterImpl;
    (module as any).exports.EventEmitter = EventEmitterImpl;
  }
}

// Re-export for use in other modules
export { BufferPolyfill as Buffer, EventEmitterImpl as EventEmitter };
export default EventEmitterImpl;
