import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import "@github/spark/spark";

import App from './App.tsx';
import ErrorFallback from './ErrorFallback.tsx';
import './main.css';
import './styles/theme.css';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element. Ensure there is a div with id="root" in your HTML.');
}

window.addEventListener('error', (event) => {
  console.error('[Global] Uncaught error:', event.error);
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global] Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('[Root] Error caught by boundary:', error, errorInfo);
      }}
      onReset={() => {
        console.log('[Root] Error boundary reset');
        window.location.href = window.location.pathname;
      }}
    >
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster 
          position="top-right" 
          expand={false} 
          richColors 
          closeButton
          toastOptions={{
            style: {
              background: 'oklch(0.12 0.03 280)',
              border: '1px solid oklch(0.35 0.12 195)',
              color: 'oklch(0.85 0.12 195)',
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
