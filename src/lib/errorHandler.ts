// Standardized Error Handling — Production-Ready
// November 24, 2025 — Quantum Falcon Cockpit
// Centralized error handling with retry, recovery, and user-friendly messages

import { logger } from './logger'
import { ERROR_MESSAGES } from './constants'
import { toast } from 'sonner'

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, unknown>
}

export interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  onRetry?: (attempt: number) => void
}

/**
 * Standardized error handler
 * Logs errors, shows user-friendly messages, and optionally retries
 */
export function handleError(
  error: Error | unknown,
  context: ErrorContext = {},
  options?: {
    showToast?: boolean
    toastMessage?: string
    silent?: boolean
  }
): void {
  const { component = 'Unknown', action, userId, metadata } = context
  const { showToast = true, toastMessage, silent = false } = options || {}

  // Log error
  if (!silent) {
    logger.error(
      action ? `${action} failed` : 'Operation failed',
      component,
      error,
      metadata
    )
  }

  // Show user-friendly message
  if (showToast && !silent) {
    const message = toastMessage || ERROR_MESSAGES.GENERIC_ERROR
    toast.error('Error', {
      description: message,
      duration: 5000
    })
  }
}

/**
 * Async operation with automatic retry
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onRetry
  } = options

  let lastError: Error | unknown
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      attempt++

      if (attempt >= maxRetries) {
        throw error
      }

      const delay = exponentialBackoff
        ? retryDelay * Math.pow(2, attempt - 1)
        : retryDelay

      if (onRetry) {
        onRetry(attempt)
      }

      logger.debug(
        `Retry attempt ${attempt}/${maxRetries} after ${delay}ms`,
        'withRetry',
        error
      )

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Safe async operation wrapper
 * Catches errors and handles them gracefully
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await operation()
  } catch (error) {
    handleError(error, context, {
      showToast: false,
      silent: true
    })
    return fallback
  }
}

/**
 * Network error handler with retry
 */
export async function withNetworkRetry<T>(
  operation: () => Promise<T>,
  context: ErrorContext = {}
): Promise<T> {
  return withRetry(operation, {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    onRetry: (attempt) => {
      logger.debug(`Network retry ${attempt}`, context.component)
    }
  }).catch((error) => {
    handleError(error, context, {
      toastMessage: ERROR_MESSAGES.NETWORK_ERROR
    })
    throw error
  })
}

/**
 * Validation error handler
 */
export function handleValidationError(
  field: string,
  message: string,
  context: ErrorContext = {}
): void {
  logger.warn(`Validation failed: ${field}`, context.component || 'Validation', {
    field,
    message
  })

  toast.error('Validation Error', {
    description: `${field}: ${message}`,
    duration: 3000
  })
}

