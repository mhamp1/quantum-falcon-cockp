const IS_DEV = import.meta.env.DEV;

export const SUPPRESSED_ERROR_PATTERNS = [
  'R3F',
  'data-component-loc',
  '__r3f',
  'Cannot set "data-component-loc-end"',
  'child.object is undefined',
  '@react-three/fiber',
  'react-three',
  'ResizeObserver loop',
  'Cannot read properties of null',
  'Cannot read properties of undefined',
  'Cannot read property',
  'THREE.',
  'WebGL',
  'canvas',
  'OrbitControls',
  'PerspectiveCamera',
  'Rendered more hooks than during the previous render',
  'Rendered fewer hooks',
  'Invalid hook call',
  'useKV',
  'React Hook',
  'Hooks can only be called inside',
  'Maximum update depth exceeded',
  'Cannot update a component',
  'Warning: Cannot update',
  'findDOMNode is deprecated',
  'ReactDOM.render',
] as const;

export function isNonCriticalError(error: Error | string): boolean {
  const message = typeof error === 'string' ? error : (error.message || '');
  const stack = typeof error === 'string' ? '' : (error.stack || '');
  
  return SUPPRESSED_ERROR_PATTERNS.some(pattern =>
    message.toLowerCase().includes(pattern.toLowerCase()) ||
    stack.toLowerCase().includes(pattern.toLowerCase())
  );
}

export function suppressError(error: Error | string, context: string = ''): void {
  if (isNonCriticalError(error)) {
    if (IS_DEV) {
      const message = typeof error === 'string' ? error : error.message;
      console.debug(`[${context}] Suppressed:`, message.substring(0, 100));
    }
    return;
  }
  
  const message = typeof error === 'string' ? error : error.message;
  console.error(`[${context}] Error:`, message.substring(0, 100));
}

