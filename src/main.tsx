import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { WalletProvider } from '@/providers/WalletProvider';
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
    message.includes('ResizeObserver') ||
    message.includes('useContext') ||
    message.includes('dispatcher') ||
    message.includes('Rendered more hooks than') ||
    message.includes('hooks can only be called') ||
    message.includes('Failed to fetch KV key') ||
    message.includes('Failed to set key') ||
    message.includes('KV storage') ||
    message.includes('_spark/kv') ||
    message.includes('RefreshRuntime.register') ||
    message.includes('RefreshRuntime') && message.includes('not a function') ||
    stack.includes('@react-three/fiber') ||
    stack.includes('react-three') ||
    stack.includes('spark/hooks')
  )
}

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args.join(' ');
  if (isR3FError(message)) {
    return;
  }
  originalConsoleError.apply(console, args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  if (isR3FError(message)) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

window.addEventListener('error', (event) => {
  if (isR3FError(event.error || event.message)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return true;
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  if (isR3FError(event.reason)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return;
  }
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

// Global error handler for unhandled chunk loading errors
window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('Loading chunk') ||
    event.message.includes('Failed to fetch dynamically imported module') ||
    event.message.includes('Importing a module script failed')
  )) {
    console.error('[ChunkLoadError] Detected chunk loading failure:', event.message);
    // Force page reload on chunk load failure
    if (confirm('Failed to load application resources. Reload page?')) {
      window.location.reload();
    }
  }
}, true);

// Handle unhandled promise rejections from lazy imports
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && typeof event.reason === 'object' && 'message' in event.reason) {
    const message = String(event.reason.message || '');
    if (message.includes('Loading chunk') || message.includes('Failed to fetch dynamically imported module')) {
      console.error('[ChunkLoadError] Unhandled chunk loading rejection:', message);
      event.preventDefault();
      if (confirm('Failed to load application resources. Reload page?')) {
        window.location.reload();
      }
    }
  }
});

// Add console logging to debug white screen
console.log('[main.tsx] Starting render...');
console.log('[main.tsx] Root element:', rootElement);
console.log('[main.tsx] Window available:', typeof window !== 'undefined');

try {
  console.log('[main.tsx] Attempting to render app...');
  root.render(
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('[main.tsx] ErrorBoundary caught error:', error);
        if (isR3FError(error)) {
          return;
        }
        // Log chunk loading errors
        if (error.message && (
          error.message.includes('Loading chunk') ||
          error.message.includes('Failed to fetch dynamically imported module')
        )) {
          console.error('[ErrorBoundary] Chunk loading error detected:', error.message);
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <App />
        </WalletProvider>
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
  console.log('[main.tsx] Render completed successfully');
} catch (error) {
  console.error('[main.tsx] Fatal render error:', error);
  console.error('[Root] Fatal render error:', error);
  if (error instanceof Error && !isR3FError(error)) {
    root.render(
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'oklch(0.08 0.02 280)',
        color: 'oklch(0.85 0.12 195)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'oklch(0.65 0.25 25)' }}>
            Critical Error
          </h1>
          <p style={{ marginBottom: '2rem' }}>{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem',
              background: 'oklch(0.72 0.20 195)',
              color: 'oklch(0.08 0.02 280)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }
}
