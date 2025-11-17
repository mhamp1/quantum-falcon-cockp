// Error Handling Component (Error Boundary Fallback) - Further enhanced with error reporting, retry logic, and improved accessibility
import { useEffect, useState } from 'react';
import { AlertTriangleIcon, RefreshCwIcon, CopyIcon, SendIcon } from 'lucide
interface ErrorFallbackProps {
  resetErrorBoundary: () => void;

interface ErrorFallbackProps {
    await navig
  resetErrorBoundary: () => void;
 

// Simulate sending error report (replace wit
  try {
    con
  } catch (err) {
  }
    console.log('Error details copied to clipboard');
  } catch (err) {
    console.error('Failed to copy error to clipboard:', err);
  }
};

// Simulate sending error report (replace with actual API call)
const reportError = async (error: Error) => {
  try {
    // Example: Send to error tracking service
    console.log('Reporting error:', error.message);
    // await fetch('/api/report-error', { method: 'POST', body: JSON.stringify({ error: error.message, stack: error.stack }) });
  } catch (err) {
    console.error('Failed to report error:', err);
  }
};

              aria-label="Copy error details to clipboard"
              <CopyIcon size={16} />
          </div>

          {error.st
              <summary className="text-xs text-
              

        </div>
        <div className="f
            onClick={resetErr
            variant="outl
          >
    

          
            aria-label="Report this error"
            <SendIcon aria-hidden="true" classNam
          </Button>
      </div>
  );












              aria-label="Copy error details to clipboard"
            >
              <CopyIcon size={16} />
            </Button>
          </div>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-32">
            {error.message}
          </pre>
          {error.stack && (
            <details className="mt-2">
              <summary className="text-xs text-muted-foreground cursor-pointer">Show full stack trace</summary>
              <pre className="text-xs text-muted-foreground mt-2 bg-muted/50 p-3 rounded border overflow-auto max-h-48">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={resetErrorBoundary}
            className="flex-1"
            variant="outline"
            aria-label="Retry loading the application"
          >
            <RefreshCwIcon aria-hidden="true" className="mr-2" />
            Try Again
          </Button>
          <Button
            onClick={handleReport}
            disabled={isReporting || hasReported}
            variant="secondary"
            aria-label="Report this error"
          >
            <SendIcon aria-hidden="true" className="mr-2" />
            {isReporting ? 'Reporting...' : hasReported ? 'Reported' : 'Report'}
          </Button>
        </div>
      </div>
    </div>
  );
};
