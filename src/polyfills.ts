import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  (window as any).global = window;
  (window as any).process = {
    env: {},
    nextTick: (fn: Function) => setTimeout(fn, 0),
  };
}

export {};
