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
  'canvas',
  'WebGL context',
  'orbitron.json',
  'Text3D',
  'Font',
  'Cannot read properties of undefined',
  'reading \'object\'',
  // CSS parsing errors (harmless browser warnings)
  'Error in parsing value',
  'Declaration dropped',
  'Unknown property',
  'field-sizing',
  'user-select',
  '-webkit-text-size-adjust',
  'opacity',
  'Ruleset ignored',
  'bad selector',
] as const;

export const CRITICAL_ERROR_PATTERNS = [
  'Module not found',
  'Unexpected token',
  'Syntax error',
] as const;

export function isNonCriticalError(error: Error | string | unknown): boolean {
  if (!error) {
    return true; // Treat null/undefined as non-critical
  }

  let message = '';
  let stack = '';

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message || '';
    stack = error.stack || '';
  } else {
    message = String(error);
  }
  
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

export function suppressError(error: Error | string | unknown, context: string = ''): void {
  if (isNonCriticalError(error)) {
    if (IS_DEV) {
      let message = '';
      if (typeof error === 'string') {
        message = error;
      } else if (error instanceof Error) {
        message = error.message || '';
      } else {
        message = String(error || '');
      }
      console.debug(`[${context}] Suppressed:`, String(message).substring(0, 100));
    }
    return;
  }
  
  let message = '';
  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message || '';
  } else {
    message = String(error || '');
  }
  console.error(`[${context}] Error:`, message);
}

