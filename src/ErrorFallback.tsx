import { useState } from 'react';
import { Button } from '@/components/ui/button';
interface ErrorFallbackProps {

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

      console.error('Failed to copy error to clipboard:', err);
  };
  const handleReport = async () => {

      await new Promise(resolve =>
    } cat
    } finally {
    }

      console.error('Failed to copy error to clipboard:', err);
    }
  };

  const handleReport = async () => {
    setIsReporting(true);
    try {
      console.log('Reporting error:', error.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasReported(true);
    } catch (err) {
      console.error('Failed to report error:', err);
    } finally {
      setIsReporting(false);
    }
  };

  return (
            <details className="mt-2">
                Show full stack trace
              <pre className="text-xs text-muted
              </pre>
          )}

          <Button
            className="flex-1 gap-2"
            aria-label="Retry loading the
            <Arro
          </Button>
            onClick={handleReport}
            vari
            aria
            <P

      </div>
  );






















































