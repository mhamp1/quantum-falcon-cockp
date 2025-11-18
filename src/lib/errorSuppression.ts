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
  'THREE.',
  'WebGL',
  'OrbitControls',
  'PerspectiveCamera',
  'findDOMNode is deprecated',
  'ReactDOM.render',
  'ResizeObserver',
  'non-passive event listener',
  'Violation',
  'Failed to fetch KV key',
  'Failed to set key',
  'KV storage',
  '_spark/kv',
] as const;

export const CRITICAL_ERROR_PATTERNS = [
  'Failed to fetch',
  'Network request failed',
  'Syntax error',
  'Module not found',
  'Unexpected token',
] as const;

export function isNonCriticalError(error: Error | string): boolean {
  const message = typeof error === 'string' ? error : (error.message || '');
  const stack = typeof error === 'string' ? '' : (error.stack || '');
  
  const isCritical = CRITICAL_ERROR_PATTERNS.some(pattern =>
    message.includes(pattern) || stack.includes(pattern)
  );
  
  if (isCritical) {
    return false;
  }
  
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
  console.error(`[${context}] Error:`, message);
}

