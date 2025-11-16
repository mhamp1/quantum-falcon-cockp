// Entry Point File (Main Script) - Further enhanced with React.StrictMode for development checks, performance optimizations, and better error boundaries
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { StrictMode } from 'react';
import '@github/spark/spark';

// Import components and styles
import App from './App.tsx';
import { ErrorFallback } from './ErrorFallback.tsx';
import './main.css';
import './styles/theme.css';
import './index.css';

// Get the root element with proper error handling and type assertion
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element. Ensure there is a div with id="root" in your HTML.');
}

// Create and render the app with StrictMode in development for additional checks
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
