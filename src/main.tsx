import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { startTransition } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import "@github/spark/spark";

import App from './App.tsx';
import ErrorFallback from './ErrorFallback.tsx';
import './main.css';
import './styles/theme.css';
import './index.css';

function isR3FError(error: Error | string): boolean {
  const message = typeof error === 'string' ? error : (error?.message || '')
  const stack = typeof error === 'string' ? '' : (error?.stack || '')
  return (
    message.includes('R3F') ||
    message.includes('data-component-loc') ||
    message.includes('__r3f') ||
    message.includes('Cannot set "data-component-loc-end"') ||
    message.includes('child.object is undefined') ||
    message.includes('addEventListener') && message.includes('null') ||
    stack.includes('@react-three/fiber') ||
    stack.includes('react-three')
  )
}

window.addEventListener('error', (event) => {
  if (isR3FError(event.error || event.message)) {
    console.warn('[Global] R3F error suppressed:', event.message);
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  console.error('[Global] Uncaught error:', event.error);
}, true);

window.addEventListener('unhandledrejection', (event) => {
  if (isR3FError(event.reason)) {
    console.warn('[Global] R3F promise rejection suppressed:', event.reason);
    event.preventDefault();
    return;
  }
  console.error('[Global] Unhandled promise rejection:', event.reason);
});

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

function renderApp() {
  root.render(
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        if (isR3FError(error)) {
          console.warn('[Root] R3F error suppressed in boundary:', error.message);
          return;
        }
        console.error('[Root] Error caught by boundary:', error, errorInfo);
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
  );
}

startTransition(() => {
  renderApp();
});
