// XSS Protection with DOMPurify
// November 26, 2025 — Quantum Falcon Cockpit

import DOMPurify from 'dompurify'

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - User input string that may contain HTML
 * @returns Sanitized string safe for rendering
 */
export function sanitizeInput(input: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic sanitization
    return input.replace(/<[^>]*>/g, '')
  }
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  })
}

/**
 * Sanitizes HTML content for safe rendering
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined') {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  }
  
  return DOMPurify.sanitize(html)
}

/**
 * Sanitizes object values recursively
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as T[Extract<keyof T, string>]
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]) as T[Extract<keyof T, string>]
    }
  }
  
  return sanitized
}

