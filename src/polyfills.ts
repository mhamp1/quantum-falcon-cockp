// Polyfills for Node.js modules in browser environment
// Must be imported first in main.tsx

// CRITICAL: Handle module format issues for browser compatibility

// Try to import from polyfills already injected by vite-plugin-node-polyfills
// The plugin should have already made these available as globals

// Setup global environment first
if (typeof window !== 'undefined') {
  // Global reference
  (window as any).global = window;
  (globalThis as any).global = globalThis;
  
  // Process polyfill (extended) - do this first as it's needed by other modules
  if (!(window as any).process || typeof (window as any).process.nextTick === 'undefined') {
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
    (globalThis as any).process = (window as any).process;
  }
}

// Minimal EventEmitter fallback
class MinimalEventEmitter {
  private events: Map<string, Function[]> = new Map();
  on(event: string, handler: Function) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event)!.push(handler);
    return this;
  }
  once(event: string, handler: Function) {
    const wrapper = (...args: any[]) => {
      this.off(event, wrapper);
      handler(...args);
    };
    return this.on(event, wrapper);
  }
  emit(event: string, ...args: any[]) {
    const handlers = this.events.get(event);
    if (handlers) handlers.forEach(h => h(...args));
    return this;
  }
  off(event: string, handler: Function) {
    const handlers = this.events.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    }
    return this;
  }
  removeListener(event: string, handler: Function) {
    return this.off(event, handler);
  }
  removeAllListeners(event?: string) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }
}

// Check if Buffer is already available from polyfill plugin
const BufferPolyfill = (window as any).Buffer || (globalThis as any).Buffer;

// Check if EventEmitter is available, otherwise use minimal implementation
const EventEmitterImpl = (window as any).EventEmitter || (globalThis as any).EventEmitter || MinimalEventEmitter;

// Ensure they're set on all global scopes
if (typeof window !== 'undefined') {
  if (BufferPolyfill) {
    (window as any).Buffer = BufferPolyfill;
    (globalThis as any).Buffer = BufferPolyfill;
  }
  
  (window as any).EventEmitter = EventEmitterImpl;
  (globalThis as any).EventEmitter = EventEmitterImpl;
  
  console.log('[Polyfills] Buffer type:', BufferPolyfill ? 'available' : 'unavailable');
  console.log('[Polyfills] EventEmitter type:', EventEmitterImpl ? 'available' : 'unavailable');
  console.log('[Polyfills] Process type:', (window as any).process ? 'available' : 'unavailable');
  console.log('[Polyfills] Global setup complete');
}

// Re-export with named exports for compatibility
export { BufferPolyfill as Buffer, EventEmitterImpl as EventEmitter };
export default EventEmitterImpl;
