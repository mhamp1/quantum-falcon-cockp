# Error Suppression Fix

## Problem
The application was showing component error boundaries for non-critical errors that don't affect functionality, including:
- React Three Fiber (R3F) rendering errors
- ResizeObserver loop warnings
- React Hook warnings
- WebGL/Canvas errors
- Component lifecycle warnings

## Solution
Implemented a centralized error suppression system that filters out non-critical errors at multiple levels:

### 1. Centralized Error Patterns (`src/lib/errorSuppression.ts`)
Created a single source of truth for all suppressed error patterns:
- R3F and Three.js errors
- React Hook warnings
- ResizeObserver issues
- WebGL/Canvas errors
- Component update warnings

### 2. Updated Error Boundary (`src/components/ErrorBoundary.tsx`)
- Uses centralized `isNonCriticalError()` utility
- Suppresses errors silently in `getDerivedStateFromError`
- Skips error handling for non-critical errors in `componentDidCatch`
- Only shows error UI for actual critical errors

### 3. Enhanced App-Level Error Handling (`src/App.tsx`)
- Global window error handler filters non-critical errors
- Unhandled promise rejection handler suppresses known patterns
- Component error fallback auto-resets for non-critical errors
- Error counter prevents error loops

### 4. Benefits
- ✅ No more error boundaries for non-critical warnings
- ✅ Cleaner console output (only shows suppressed errors in dev mode)
- ✅ Better user experience - no interruptions
- ✅ Easier debugging - real errors still logged
- ✅ Centralized maintenance - one place to add new patterns

## How It Works

### Error Flow
1. Error occurs in component
2. `ErrorBoundary.getDerivedStateFromError()` checks if non-critical
3. If non-critical: returns `hasError: false` (no error UI shown)
4. If critical: shows error fallback with retry button

### Global Error Flow
1. Window error event fires
2. `handleWindowError` checks against suppressed patterns
3. If non-critical: prevents default behavior and stops propagation
4. If critical: allows normal error handling

### Component Error Flow
1. Error caught by `ErrorBoundary`
2. `ComponentErrorFallback` checks if non-critical
3. If non-critical: auto-resets boundary immediately (returns null)
4. If critical: shows error UI with retry/reload buttons

## Usage

### Adding New Error Patterns
Edit `src/lib/errorSuppression.ts` and add pattern to array:

```typescript
export const SUPPRESSED_ERROR_PATTERNS = [
  // ... existing patterns
  'Your new error pattern',
] as const;
```

### Checking if Error is Non-Critical
```typescript
import { isNonCriticalError } from '@/lib/errorSuppression';

if (isNonCriticalError(error)) {
  // Handle suppressed error
}
```

### Logging Suppressed Errors (Dev Mode Only)
```typescript
import { suppressError } from '@/lib/errorSuppression';

suppressError(error, 'ComponentName');
```

## Testing
1. Check that non-critical errors don't show error boundaries
2. Verify critical errors still display properly
3. Confirm auto-reset works for suppressed errors
4. Test error counter prevents infinite loops

## Maintenance
- All error patterns centralized in one file
- Easy to add new patterns
- Clear separation of critical vs non-critical
- Development mode logging for debugging
