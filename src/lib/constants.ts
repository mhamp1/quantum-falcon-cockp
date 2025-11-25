// Application Constants — Centralized Configuration
// November 24, 2025 — Quantum Falcon Cockpit

/**
 * Application-wide constants
 * All magic numbers, strings, and configuration values should be defined here
 */

// Application Info
export const APP_NAME = 'Quantum Falcon Cockpit'
export const APP_VERSION = '2025.1.0'
export const APP_BUILD_DATE = 'November 24, 2025'

// Storage Keys
export const STORAGE_KEYS = {
  AUTH: 'user-auth',
  ACTIVE_TAB: 'active-tab',
  BOT_AGGRESSION: 'bot-aggression',
  BOT_RUNNING: 'bot-running',
  PAPER_TRADING: 'paper-trading-mode',
  LIVE_ALERTS: 'live-alerts',
  TRADING_AGENTS: 'trading-agents',
  USER_PROFILE: 'user-profile-full',
  USER_XP: 'user-xp-profile',
  COMPLETED_QUESTS: 'completed-quests',
  AUTONOMOUS_TELEMETRY: 'autonomous-telemetry',
  AGGRESSION_PROFILE: 'autonomous-aggression-profile',
  FIRST_TIME_SEEN: 'qf:firstTimeSeen_v1',
  ONBOARDING_SEEN: 'hasSeenOnboarding',
  JUST_LOGGED_IN: 'justLoggedIn',
  UNLOCKED_BENEFITS: 'qf-unlocked-benefits',
  MASTER_KEY_HASH: 'qf-master-key-hash',
  PERSISTENT_AUTH: 'qf-persistent-auth',
} as const

// Feature Flags
export const FEATURE_FLAGS = {
  FLASH_EXECUTION: 'qf-flash-execution',
  SNIPER_MODE: 'qf-sniper-mode',
  WHALE_TRACKER: 'qf-whale-tracker',
  PROFIT_AMPLIFIER: 'qf-profit-amplifier',
  SENTIMENT_SCANNER: 'qf-sentiment-scanner',
  ZERO_FEES: 'qf-zero-fees',
  CUSTOM_STRATEGIES: 'qf-custom-strategies',
} as const

// Trading Constants
export const TRADING_CONSTANTS = {
  DEFAULT_AGGRESSION: 50,
  MIN_AGGRESSION: 0,
  MAX_AGGRESSION: 100,
  DEFAULT_SLIPPAGE: 1.0,
  MIN_SLIPPAGE: 0.1,
  MAX_SLIPPAGE: 5.0,
  DEFAULT_TRADE_AMOUNT: 100,
  AUTONOMOUS_GOAL: 600, // $600/day goal
} as const

// XP Constants
export const XP_CONSTANTS = {
  BASE_XP_PER_LEVEL: 100,
  XP_MULTIPLIER: 1.5,
  INITIAL_XP_TO_NEXT: 1000,
  XP_INCREMENT_PER_LEVEL: 500,
} as const

// Time Constants
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const

// API Endpoints
export const API_ENDPOINTS = {
  LICENSE_VALIDATION: '/api/license/validate',
  LICENSE_GENERATION: '/api/license/generate',
  PAYMENT_STRIPE: '/api/payments/stripe/rental',
  PAYMENT_PAYPAL: '/api/payments/paypal/rental',
  DOCUMENTATION: '/docs/QUANTUM_FALCON_DOCUMENTATION.md',
} as const

// UI Constants
export const UI_CONSTANTS = {
  TOAST_DURATION: {
    SHORT: 2000,
    MEDIUM: 5000,
    LONG: 10000,
  },
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  DEBOUNCE_DELAY: 300,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  LICENSE_INVALID: 'Invalid license key. Please check and try again.',
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  TRADE_FAILED: 'Trade execution failed. Please try again.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LICENSE_VALIDATED: 'License validated successfully',
  PAYMENT_SUCCESS: 'Payment processed successfully',
  TRADE_SUCCESS: 'Trade executed successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const

