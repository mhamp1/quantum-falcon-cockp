// Polyfills for Node.js modules in browser environment

// Import with proper ESM compatibility
import { Buffer as BufferPolyfill } from 'buffer';
import EventEmitter3 from 'eventemitter3';

// Use EventEmitter3 as the implementation
const EventEmitterImpl = EventEmitter3;

// Buffer polyfill
if (typeof window !== 'undefined') {
  (window as any).Buffer = BufferPolyfill;
  (globalThis as any).Buffer = BufferPolyfill;
  
  // Global reference
  (window as any).global = window;
  (globalThis as any).global = globalThis;
  
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
      title: 'browser',
      argv: [],
      pid: 1,
      umask: () => 0,
    };
  }

  // EventEmitter - set on window and as module export
  (window as any).EventEmitter = EventEmitterImpl;

  // Ensure eventemitter3 module has proper exports
  if (typeof (window as any).__vite_ssr_import_2__ === 'undefined') {
    (window as any).__vite_ssr_import_2__ = {
      EventEmitter: EventEmitterImpl,
      default: EventEmitterImpl,
    };
  }

  console.log('[Polyfills] Buffer:', typeof BufferPolyfill);
  console.log('[Polyfills] EventEmitter:', typeof EventEmitterImpl);
  console.log('[Polyfills] Global setup complete');
}

export { BufferPolyfill as Buffer, EventEmitterImpl as EventEmitter };
export default EventEmitterImpl;
