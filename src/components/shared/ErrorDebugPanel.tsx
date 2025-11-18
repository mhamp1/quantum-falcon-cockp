import { useState, useEffect } from 'react';
import { Bug, X, Copy, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { errorLogger, getErrorReport } from '@/lib/errorLogger';
import { cn } from '@/lib/utils';

const IS_DEV = import.meta.env.DEV;

export default function ErrorDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!IS_DEV) return;
    
    const interval = setInterval(() => {
      setErrors(errorLogger.getRecentErrors(20));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = async () => {
    try {
      const report = getErrorReport();
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error report:', err);
    }
  };

  const handleClear = () => {
    errorLogger.clear();
    setErrors([]);
  };

  if (!IS_DEV) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 left-4 z-[100] p-3 rounded-full",
          "bg-destructive/20 border-2 border-destructive",
          "hover:bg-destructive/30 transition-all",
          "shadow-lg hover:shadow-xl",
          errors.length > 0 && "animate-pulse"
        )}
        title="Error Debug Panel (Dev Only)"
      >
        <Bug size={24} weight="duotone" className="text-destructive" />
        {errors.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {errors.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[99] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cyber-card max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-primary/30">
              <div className="flex items-center gap-2">
                <Bug size={24} weight="duotone" className="text-destructive" />
                <h2 className="text-lg font-bold uppercase tracking-wide">
                  Error Debug Panel
                </h2>
                <span className="text-xs text-muted-foreground">
                  (Dev Only - {errors.length} errors)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={copied || errors.length === 0}
                >
                  <Copy size={16} />
                  {copied ? 'Copied!' : 'Copy All'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={errors.length === 0}
                >
                  <Trash size={16} />
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {errors.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm uppercase tracking-wider">No errors logged</p>
                </div>
              ) : (
                errors.map((error, index) => (
                  <div
                    key={index}
                    className="bg-muted/20 p-3 rounded border border-destructive/30 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-destructive">
                          {error.message}
                        </p>
                        {error.context && (
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                            Context: {error.context}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {error.stack && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground uppercase tracking-wide">
                          Stack Trace
                        </summary>
                        <pre className="mt-2 p-2 bg-background/50 rounded overflow-auto max-h-32 font-mono text-[10px]">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                    {error.componentStack && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground uppercase tracking-wide">
                          Component Stack
                        </summary>
                        <pre className="mt-2 p-2 bg-background/50 rounded overflow-auto max-h-32 font-mono text-[10px]">
                          {error.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
