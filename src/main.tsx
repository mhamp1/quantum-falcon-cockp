// Entry Point File (Main Script) - Enhanced with React.StrictMode for development checks, performance optimizations, and better error boundaries
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Conditionally import Spark runtime only if running in Spark environment
// This prevents 401/403 errors in local development
if (import.meta.env.MODE === 'production' || window.location.hostname.includes('github')) {
  import('@github/spark/spark').catch(() => {
    console.info('[Spark] Running in local development mode - using localStorage fallback')
  })
}

// Import components and styles
import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import './main.css'
import './styles/theme.css'
import './index.css'

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Get the root element with proper error handling and type assertion
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element. Ensure there is a div with id="root" in your HTML.')
}

// Create and render the app with StrictMode in development for additional checks
const root = createRoot(rootElement)
root.render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
)
