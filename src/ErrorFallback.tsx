import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowClockwise, Copy, PaperPlaneTilt, Warning } from '@phosphor-icons/react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(error.stack || error.message);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
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

  const handleRetry = () => {
    console.log('Attempting to recover from error...');
    resetErrorBoundary();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="cyber-card p-8 max-w-2xl w-full space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-destructive/20">
            <Warning size={32} weight="duotone" className="text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-destructive uppercase tracking-wide">
              System Error
            </h1>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Critical failure detected
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-foreground font-medium">
            {error.message}
          </p>
          
          {error.stack && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground uppercase tracking-wide">
                Show full stack trace
              </summary>
              <pre className="text-xs text-muted-foreground mt-2 p-4 bg-muted/20 rounded overflow-auto max-h-64 scrollbar-thin">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={handleRetry}
            className="flex-1 gap-2"
            aria-label="Retry loading the application"
          >
            <ArrowClockwise size={18} weight="bold" />
            Retry
          </Button>
          
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1 gap-2"
            disabled={isCopied}
            aria-label="Copy error details to clipboard"
          >
            <Copy size={18} weight={isCopied ? "fill" : "bold"} />
            {isCopied ? 'Copied!' : 'Copy Error'}
          </Button>
          
          <Button
            onClick={handleReport}
            variant="secondary"
            className="flex-1 gap-2"
            disabled={isReporting || hasReported}
            aria-label="Report error to developers"
          >
            <PaperPlaneTilt size={18} weight="bold" />
            {hasReported ? 'Reported' : isReporting ? 'Reporting...' : 'Report'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          If the problem persists, please contact support with the error details above.
        </p>
      </div>
    </div>
  );
}
