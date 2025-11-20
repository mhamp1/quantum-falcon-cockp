import { isNonCriticalError } from './errorSuppression';

const IS_DEV = import.meta.env.DEV;

interface ErrorLogEntry {
  timestamp: number;
  message: string;
  stack?: string;
  context?: string;
  componentStack?: string;
}

class ErrorLogger {
  private errors: ErrorLogEntry[] = [];
  private maxErrors = 50;

  log(error: Error | string | unknown, context?: string, componentStack?: string) {
    // Handle undefined/null errors
    if (!error) {
      console.debug('[ErrorLogger] Skipping null/undefined error');
      return;
    }

    // Filter out KV errors and other non-critical errors
    if (isNonCriticalError(error)) {
      return;
    }

    let message: string;
    let stack: string | undefined;

    if (typeof error === 'string') {
      message = error;
      stack = undefined;
    } else if (error instanceof Error) {
      message = error.message || 'Unknown error';
      stack = error.stack;
    } else {
      message = String(error);
      stack = undefined;
    }

    const entry: ErrorLogEntry = {
      timestamp: Date.now(),
      message,
      stack,
      context,
      componentStack
    };

    this.errors.push(entry);
    
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    if (IS_DEV) {
      console.log('[ErrorLogger]', entry);
    }
  }

  getErrors(): ErrorLogEntry[] {
    return [...this.errors];
  }

  getRecentErrors(count: number = 10): ErrorLogEntry[] {
    return this.errors.slice(-count);
  }

  clear() {
    this.errors = [];
  }

  export(): string {
    return JSON.stringify(this.errors, null, 2);
  }
}

export const errorLogger = new ErrorLogger();

export function logError(error: Error | string | unknown, context?: string, componentStack?: string) {
  errorLogger.log(error, context, componentStack);
}

export function getErrorReport(): string {
  return errorLogger.export();
}
