// Haptic Feedback Utility — Mobile Premium Feel
// November 21, 2025 — Quantum Falcon Cockpit

/**
 * Provides haptic feedback on mobile devices
 * Falls back gracefully on desktop (no-op)
 */
export const hapticFeedback = {
  /**
   * Light impact - for button presses, toggles
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium impact - for important actions
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  /**
   * Heavy impact - for critical actions, errors
   */
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },

  /**
   * Success pattern - short-long-short
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  /**
   * Error pattern - three quick pulses
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 20, 10, 20, 10]);
    }
  },

  /**
   * Profit milestone - celebratory pattern
   */
  celebration: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 30, 20, 30, 40, 50]);
    }
  },
};

