/**
 * First-Time User Tracking
 * 
 * Minimal, frontend-only first-time-user tracker backed by localStorage.
 * Tracks whether a user has seen the intro splash experience.
 */

const FIRST_TIME_KEY = 'qf:firstTimeSeen_v1';

/**
 * Check if this is a first-time user (has not seen the intro splash)
 * @returns true if first-time user, false if they've seen the intro
 */
export function isFirstTimeUser(): boolean {
  // Safely handle SSR - return false if window is not available
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = window.localStorage.getItem(FIRST_TIME_KEY);
    // If the key doesn't exist or is not 'true', it's a first-time user
    return stored !== 'true';
  } catch (error) {
    // If localStorage is not available, treat as first-time user
    console.warn('[FirstTimeUser] localStorage not available:', error);
    return true;
  }
}

/**
 * Mark that the user has completed the first-time intro experience
 */
export function markFirstTimeComplete(): void {
  // Safely handle SSR - do nothing if window is not available
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(FIRST_TIME_KEY, 'true');
    console.info('[FirstTimeUser] First-time intro marked as complete');
  } catch (error) {
    console.error('[FirstTimeUser] Failed to save first-time status:', error);
  }
}

/**
 * Reset first-time status (useful for testing)
 */
export function resetFirstTimeStatus(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(FIRST_TIME_KEY);
    console.info('[FirstTimeUser] First-time status reset');
  } catch (error) {
    console.error('[FirstTimeUser] Failed to reset first-time status:', error);
  }
}
