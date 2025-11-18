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

  log(error: Error | string, context?: string, componentStack?: string) {
    const entry: ErrorLogEntry = {
      timestamp: Date.now(),
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
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

export function logError(error: Error | string, context?: string, componentStack?: string) {
  errorLogger.log(error, context, componentStack);
}

export function getErrorReport(): string {
  return errorLogger.export();
}
