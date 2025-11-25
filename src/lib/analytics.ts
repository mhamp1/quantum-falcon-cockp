// Analytics & Telemetry System — User Behavior Tracking
// November 24, 2025 — Quantum Falcon Cockpit
// Production-ready analytics for data-driven decisions

import { logger } from './logger'
import { useKVSafe } from '@/hooks/useKVFallback'

export type EventType = 
  | 'page_view'
  | 'feature_used'
  | 'trade_executed'
  | 'strategy_activated'
  | 'upgrade_clicked'
  | 'rental_started'
  | 'challenge_completed'
  | 'quest_completed'
  | 'error_occurred'
  | 'performance_metric'

export interface AnalyticsEvent {
  type: EventType
  name: string
  properties?: Record<string, unknown>
  userId?: string
  timestamp: number
  sessionId: string
}

class Analytics {
  private events: AnalyticsEvent[] = []
  private maxEvents = 1000
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  /**
   * Track an event
   */
  track(
    type: EventType,
    name: string,
    properties?: Record<string, unknown>,
    userId?: string
  ): void {
    const event: AnalyticsEvent = {
      type,
      name,
      properties,
      userId,
      timestamp: Date.now(),
      sessionId: this.sessionId
    }

    this.events.push(event)
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    // In production, send to analytics service
    if (import.meta.env.PROD) {
      this.sendToAnalytics(event).catch(error => {
        logger.debug('Failed to send analytics event', 'Analytics', error)
      })
    } else {
      logger.debug(`Analytics: ${type} - ${name}`, 'Analytics', properties)
    }
  }

  /**
   * Track page view
   */
  pageView(page: string, properties?: Record<string, unknown>): void {
    this.track('page_view', page, properties)
  }

  /**
   * Track feature usage
   */
  featureUsed(feature: string, properties?: Record<string, unknown>): void {
    this.track('feature_used', feature, properties)
  }

  /**
   * Track trade execution
   */
  tradeExecuted(trade: {
    symbol: string
    side: 'buy' | 'sell'
    amount: number
    profit?: number
  }): void {
    this.track('trade_executed', 'Trade Executed', trade)
  }

  /**
   * Track conversion event
   */
  conversion(event: string, value?: number, properties?: Record<string, unknown>): void {
    this.track('upgrade_clicked', event, { ...properties, value })
  }

  /**
   * Get events by type
   */
  getEvents(type?: EventType): AnalyticsEvent[] {
    if (type) {
      return this.events.filter(e => e.type === type)
    }
    return [...this.events]
  }

  /**
   * Get recent events
   */
  getRecent(count: number = 10): AnalyticsEvent[] {
    return this.events.slice(-count)
  }

  /**
   * Export events
   */
  export(): string {
    return JSON.stringify(this.events, null, 2)
  }

  /**
   * Clear events
   */
  clear(): void {
    this.events = []
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Send event to analytics service (implement in production)
   */
  private async sendToAnalytics(event: AnalyticsEvent): Promise<void> {
    // In production, send to your analytics service
    // Example: await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) })
  }
}

export const analytics = new Analytics()

/**
 * React hook for analytics
 */
export function useAnalytics() {
  const [userId] = useKVSafe<string | undefined>('user-id', undefined)

  return {
    track: (type: EventType, name: string, properties?: Record<string, unknown>) => {
      analytics.track(type, name, properties, userId)
    },
    pageView: (page: string, properties?: Record<string, unknown>) => {
      analytics.pageView(page, properties)
    },
    featureUsed: (feature: string, properties?: Record<string, unknown>) => {
      analytics.featureUsed(feature, properties)
    },
    tradeExecuted: (trade: {
      symbol: string
      side: 'buy' | 'sell'
      amount: number
      profit?: number
    }) => {
      analytics.tradeExecuted(trade)
    },
    conversion: (event: string, value?: number, properties?: Record<string, unknown>) => {
      analytics.conversion(event, value, properties)
    }
  }
}

