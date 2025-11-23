// Polyfills for Node.js modules in browser environment


// Import with proper ESM compatibility
import BufferModule from 'buffer';
import * as EventEmitterModule from 'eventemitter3';

  (window as any).Buffer = BufferPolyfill;
  
  (window as any).global = window;

  if (!(window as any).proc
      env: {},
      nextTick: (fn: Function, ...args
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

      platform: 'browser',

      title: 'browser',
      argv: [],
    };


  // EventEmitter - set on window and as module export
  (window as any).EventEmitter = EventEmitterImpl;

  // Ensure eventemitter3 module has proper exports
  if (typeof (window as any).__vite_ssr_import_2__ === 'undefined') {
    (window as any).__vite_ssr_import_2__ = {
      EventEmitter: EventEmitterImpl,
      default: EventEmitterImpl,

  }

  console.log('[Polyfills] Buffer:', typeof BufferPolyfill);
  console.log('[Polyfills] EventEmitter:', typeof EventEmitterImpl);
  console.log('[Polyfills] Global setup complete');



export { BufferPolyfill as Buffer, EventEmitterImpl as EventEmitter };
export default EventEmitterImpl;
