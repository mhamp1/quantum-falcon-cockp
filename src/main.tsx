import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { WalletProvider } from '@/providers/WalletProvider';
import { RenderSafetyWrapper } from '@/components/shared/RenderSafetyWrapper';
import "@github/spark/spark";

import App from './App.tsx';
import ErrorFallback from './ErrorFallback.tsx';
// CRITICAL: Import CSS in correct order - Tailwind must be first
import './index.css';
import './main.css';
import './styles/theme.css';

// Maximum length for debug message truncation
const MAX_DEBUG_MESSAGE_LENGTH = 100;

// Helper to check if error is a Spark KV error (with fallback available)
function isSparkKVError(message: string, stack: string): boolean {
  return (
    (message.includes('Failed to fetch KV key') && message.includes('_spark/kv')) ||
    (message.includes('Failed to set key') && message.includes('_spark/kv')) ||
    (message.includes('KV storage') && stack.includes('@github/spark')) ||
    message.includes('spark.kv')
  );
}

function isNonCriticalError(error: Error | string): boolean {
  const message = typeof error === 'string' ? error : (error?.message || '')
  const stack = typeof error === 'string' ? '' : (error?.stack || '')
  
  // Only suppress errors that are truly non-critical
  // DO NOT suppress legitimate React errors like hook violations!
  return (
    // R3F/Three.js specific errors that are cosmetic
    (message.includes('R3F') || stack.includes('@react-three/fiber')) ||
    message.includes('data-component-loc') ||
    message.includes('__r3f') ||
    message.includes('Cannot set "data-component-loc-end"') ||
    message.includes('child.object is undefined') ||
    
    // Spark KV storage errors (with fallback)
    isSparkKVError(message, stack) ||
    
    // Azure Blob Storage errors (non-critical with fallback)
    (message.includes('RestError') && message.includes('blob')) ||
    (message.includes('The specified blob does not exist') && message.includes('azure')) ||
    (message.includes('BlobNotFound') && message.includes('azure')) ||
    
    // Vite HMR non-critical warnings
    (message.includes('RefreshRuntime.register') && !message.includes('not a function'))
  )
}

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // Suppress CSS parsing warnings
  if (message.includes('Unknown property') || 
      message.includes('Declaration dropped') ||
      message.includes('Error in parsing value') ||
      message.includes('Ruleset ignored') ||
      message.includes('bad selector') ||
      message.includes('-moz-') ||
      message.includes('-webkit-') ||
      message.includes('field-sizing') ||
      message.includes('orphans') ||
      message.includes('widows')) {
    // Suppress CSS warnings completely
    return;
  }
  
  if (isNonCriticalError(message)) {
    // Log to debug console but don't spam the main console
    console.debug('[Suppressed]', message.substring(0, MAX_DEBUG_MESSAGE_LENGTH));
    return;
  }
  originalConsoleError.apply(console, args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  
  // Suppress CSS parsing warnings
  if (message.includes('Unknown property') || 
      message.includes('Declaration dropped') ||
      message.includes('Error in parsing value') ||
      message.includes('Ruleset ignored') ||
      message.includes('bad selector') ||
      message.includes('-moz-') ||
      message.includes('-webkit-') ||
      message.includes('field-sizing') ||
      message.includes('orphans') ||
      message.includes('widows')) {
    // Suppress CSS warnings completely
    return;
  }
  
  if (isNonCriticalError(message)) {
    // Log to debug console but don't spam the main console
    console.debug('[Suppressed]', message.substring(0, MAX_DEBUG_MESSAGE_LENGTH));
    return;
  }
  originalConsoleWarn.apply(console, args);
};

window.addEventListener('error', (event) => {
  const errorMessage = event.error?.message || event.message || '';
  const errorSource = event.filename || '';
  
  // Suppress module bundling errors that are harmless (vendor chunk loading)
  // These occur when chunks load out of order but resolve themselves
  if (errorMessage.includes("can't access property") && 
      (errorMessage.includes('exports') || errorMessage.includes('is undefined')) &&
      (errorSource.includes('vendor-') || errorSource.includes('assets/'))) {
    // This is a known Vite/Rollup bundling quirk with large vendor chunks
    // The module still loads correctly, this is just a timing issue
    // Retry loading the chunk after a short delay
    console.debug('[Module Load] Retrying chunk load after timing issue');
    setTimeout(() => {
      // Force reload if the error persists
      if (document.readyState === 'complete') {
        // Only reload if we're still getting errors after page load
        const errorCount = (window as any).__moduleErrorCount || 0;
        (window as any).__moduleErrorCount = errorCount + 1;
        if (errorCount > 3) {
          console.warn('[Module Load] Multiple module errors detected, reloading page');
          window.location.reload();
        }
      }
    }, 100);
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
  
  if (isNonCriticalError(event.error || event.message)) {
    console.debug('[Suppressed Error]', event.message?.substring(0, MAX_DEBUG_MESSAGE_LENGTH));
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return true;
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  if (isNonCriticalError(event.reason)) {
    console.debug('[Suppressed Rejection]', String(event.reason)?.substring(0, MAX_DEBUG_MESSAGE_LENGTH));
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

// CRITICAL: Ensure body has minimum background to prevent black screen
document.body.style.minHeight = '100vh';
document.body.style.backgroundColor = 'oklch(0.08 0.02 280)';
document.body.style.color = 'oklch(0.85 0.12 195)';
document.body.style.margin = '0';
document.body.style.padding = '0';

// Ensure root element has minimum styles
rootElement.style.minHeight = '100vh';
rootElement.style.width = '100%';

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

// Aggressive error logging for white screen debugging
console.log('[main.tsx] ========== STARTING RENDER ==========');
console.log('[main.tsx] Root element:', rootElement);
console.log('[main.tsx] Root element exists:', !!rootElement);
console.log('[main.tsx] Window available:', typeof window !== 'undefined');
console.log('[main.tsx] Document ready:', document.readyState);

// Global error handler to catch ANY errors
window.addEventListener('error', (event) => {
  console.error('[GLOBAL ERROR]', event.error || event.message, event.filename, event.lineno);
  // Don't prevent default - let ErrorBoundary handle it
}, true);

window.addEventListener('unhandledrejection', (event) => {
  console.error('[GLOBAL UNHANDLED REJECTION]', event.reason);
  // Don't prevent default - let ErrorBoundary handle it
});

// CRITICAL FIX: White screen detector - if React doesn't render in 3 seconds, show fallback
let hasRendered = false;
const whiteScreenTimeout = setTimeout(() => {
  if (!hasRendered) {
    console.error('[main.tsx] ========== WHITE SCREEN TIMEOUT ==========');
    console.error('[main.tsx] React failed to render within 3 seconds');
    console.error('[main.tsx] Showing emergency fallback UI');
    
    // Emergency fallback render - import and render EmergencyFallback component
    if (rootElement) {
      import('./components/shared/EmergencyFallback').then(({ EmergencyFallback }) => {
        const fallbackRoot = createRoot(rootElement);
        fallbackRoot.render(<EmergencyFallback />);
      }).catch(() => {
        // If even the import fails, use inline HTML
        rootElement.innerHTML = `
          <div style="
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: oklch(0.08 0.02 280);
            color: oklch(0.85 0.12 195);
            font-family: system-ui, -apple-system, sans-serif;
            padding: 2rem;
          ">
            <div style="max-width: 600px; text-align: center;">
              <h1 style="font-size: 2rem; margin-bottom: 1rem; color: oklch(0.72 0.20 195);">
                ⚠️ Critical Loading Error
              </h1>
              <p style="margin-bottom: 2rem; opacity: 0.8;">
                The application failed to load. Please reload the page.
              </p>
              <button 
                onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload()"
                style="
                  padding: 0.75rem 2rem;
                  background: oklch(0.72 0.20 195);
                  color: oklch(0.08 0.02 280);
                  border: none;
                  cursor: pointer;
                  font-size: 1rem;
                  font-weight: bold;
                  text-transform: uppercase;
                  border-radius: 0.5rem;
                "
              >
                Clear Cache & Reload
              </button>
              <p style="margin-top: 2rem; font-size: 0.75rem; opacity: 0.6;">
                Quantum Falcon Cockpit v2025.1.0
              </p>
            </div>
          </div>
        `;
      });
    }
  }
}, 3000);

try {
  console.log('[main.tsx] Attempting to render app...');
  
  // Mark render attempt
  (window as any).__reactRenderAttempted = true;
  (window as any).__reactRenderTime = Date.now();
  
  // Render with comprehensive error handling
  root.render(
    <RenderSafetyWrapper componentName="Root Application">
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onError={(error, errorInfo) => {
          console.error('[main.tsx] ========== ERRORBOUNDARY CAUGHT ERROR ==========');
          console.error('[main.tsx] Error:', error);
          console.error('[main.tsx] Error message:', error.message);
          console.error('[main.tsx] Error stack:', error.stack);
          console.error('[main.tsx] Component stack:', errorInfo.componentStack);
          
          if (isNonCriticalError(error)) {
            console.debug('[main.tsx] Non-critical error - suppressing');
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
    </RenderSafetyWrapper>
  );
  
  console.log('[main.tsx] ========== RENDER CALLED SUCCESSFULLY ==========');
  console.log('[main.tsx] Waiting for React to mount...');
  
  // Mark as rendered successfully
  hasRendered = true;
  clearTimeout(whiteScreenTimeout);
  
  // CRITICAL: Double-check render actually happened
  setTimeout(() => {
    const rootContent = rootElement.innerHTML;
    const rootChildren = rootElement.children;
    const appRenderAttempted = (window as any).__appRenderAttempted;
    
    console.log('[main.tsx] ========== DOM INSPECTION ==========');
    console.log('[main.tsx] Root element content length:', rootContent.length);
    console.log('[main.tsx] Root element has content:', rootContent.length > 0);
    console.log('[main.tsx] Root children count:', rootChildren.length);
    console.log('[main.tsx] App component attempted render:', appRenderAttempted);
    
    if (rootChildren.length > 0) {
      console.log('[main.tsx] First child:', rootChildren[0].tagName, rootChildren[0].className);
      console.log('[main.tsx] First child innerHTML length:', rootChildren[0].innerHTML.length);
    }
    
    if (rootContent.length === 0 || !appRenderAttempted) {
      console.error('[main.tsx] ========== WHITE SCREEN DETECTED ==========');
      console.error('[main.tsx] Root element is empty or App never rendered!');
      console.error('[main.tsx] This indicates React failed to mount');
      
      // Try emergency re-render
      console.log('[main.tsx] Attempting emergency re-render...');
      import('./components/shared/EmergencyFallback').then(({ EmergencyFallback }) => {
        const emergencyRoot = createRoot(rootElement);
        emergencyRoot.render(<EmergencyFallback />);
      }).catch(() => {
        console.error('[main.tsx] Emergency fallback failed to load');
      });
    } else {
      console.log('[main.tsx] ✅ Root has content - app appears to be rendering');
      console.log('[main.tsx] ✅ App component successfully rendered');
    }
  }, 1500);
  
} catch (error) {
  console.error('[main.tsx] ========== FATAL RENDER ERROR ==========');
  console.error('[main.tsx] Error type:', error?.constructor?.name);
  console.error('[main.tsx] Error message:', error instanceof Error ? error.message : String(error));
  console.error('[main.tsx] Error stack:', error instanceof Error ? error.stack : 'No stack');
  console.error('[Root] Fatal render error:', error);
  if (error instanceof Error && !isNonCriticalError(error)) {
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
