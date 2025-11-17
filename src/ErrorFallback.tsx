// Error Handling Component (Error Boundary Fallback) - Further enhanced with error reporting, retry logic, and improved accessibility
import { useEffect, useState } from "react";
import {
  AlertTriangleIcon,
  RefreshCwIcon,
  CopyIcon,
  SendIcon,
} from "lucide-react";

import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Helper function to copy error to clipboard
const copyErrorToClipboard = async (errorMessage: string) => {
  try {
    await navigator.clipboard.writeText(errorMessage);
    // Optional: Show a toast notification instead of alert
    console.log("Error details copied to clipboard");
  } catch (err) {
    console.error("Failed to copy error to clipboard:", err);
  }
};

// Simulate sending error report (replace with actual API call)
const reportError = async (error: Error) => {
  try {
    // Example: Send to error tracking service
    console.log("Reporting error:", error.message);
    // await fetch('/api/report-error', { method: 'POST', body: JSON.stringify({ error: error.message, stack: error.stack }) });
  } catch (err) {
    console.error("Failed to report error:", err);
  }
};

export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  // In development, re-throw to show in console/dev tools
  if (import.meta.env.DEV) {
    throw error;
  }

  // Log error and report automatically on mount
  useEffect(() => {
    console.error("Application error:", error);
    // Automatically report error (uncomment in production)
    // reportError(error);
  }, [error]);

  const handleReport = async () => {
    setIsReporting(true);
    await reportError(error);
    setHasReported(true);
    setIsReporting(false);
  };

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-4"
      role="alert"
    >
      <div className="w-full max-w-md space-y-6">
        <Alert variant="destructive">
          <AlertTriangleIcon aria-hidden="true" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            An unexpected error occurred. We've logged this for review. You can
            try refreshing or contact support.
          </AlertDescription>
        </Alert>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Error Details:
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                copyErrorToClipboard(
                  `${error.message}\n\nStack Trace:\n${error.stack || "N/A"}`,
                )
              }
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
              <summary className="text-xs text-muted-foreground cursor-pointer">
                Show full stack trace
              </summary>
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
            {isReporting ? "Reporting..." : hasReported ? "Reported" : "Report"}
          </Button>
        </div>
      </div>
    </div>
  );
}
