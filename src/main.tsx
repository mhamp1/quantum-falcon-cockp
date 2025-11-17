import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
