/**
 * useFirstTimeUser Hook
 * 
 * React hook wrapper around first-time user tracking utilities.
 * Provides reactive state management for first-time user status.
 */

import { useState, useCallback } from 'react';
import { isFirstTimeUser, markFirstTimeComplete } from '@/lib/firstTimeUser';

interface UseFirstTimeUserReturn {
  /**
   * Whether this is a first-time user
   */
  isFirstTime: boolean;
  
  /**
   * Mark the first-time intro as complete
   */
  complete: () => void;
}

/**
 * Hook to manage first-time user status
 * 
 * @example
 * const { isFirstTime, complete } = useFirstTimeUser();
 * 
 * if (isFirstTime) {
 *   return <IntroSplash onFinished={complete} />;
 * }
 */
export function useFirstTimeUser(): UseFirstTimeUserReturn {
  const [isFirstTime, setIsFirstTime] = useState<boolean>(() => {
    // Initialize from localStorage on mount
    return isFirstTimeUser();
  });

  // No need for additional useEffect - useState initializer already reads from localStorage

  const complete = useCallback(() => {
    markFirstTimeComplete();
    setIsFirstTime(false);
  }, []);

  return {
    isFirstTime,
    complete,
  };
}
