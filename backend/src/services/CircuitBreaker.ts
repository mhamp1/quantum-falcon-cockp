// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER SERVICE
// Protects against cascading failures and system overload
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import { logger } from './Logger.js'

export type CircuitState = 'closed' | 'open' | 'half-open'

interface CircuitBreakerConfig {
  failureThreshold: number    // Number of failures before opening
  successThreshold: number    // Number of successes to close from half-open
  timeout: number             // Time in ms to wait before half-open
  monitorInterval: number     // Interval to reset failure count
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 60000,  // 1 minute
  monitorInterval: 300000, // 5 minutes
}

export class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failureCount: number = 0
  private successCount: number = 0
  private lastFailure: Date | null = null
  private lastStateChange: Date = new Date()
  private config: CircuitBreakerConfig
  private name: string

  constructor(name: string, config?: Partial<CircuitBreakerConfig>) {
    this.name = name
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      // Check if timeout has elapsed
      if (this.shouldAttemptReset()) {
        this.transitionTo('half-open')
      } else {
        throw new Error(`Circuit breaker [${this.name}] is OPEN`)
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failureCount = 0

    if (this.state === 'half-open') {
      this.successCount++
      
      if (this.successCount >= this.config.successThreshold) {
        this.transitionTo('closed')
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failureCount++
    this.lastFailure = new Date()
    this.successCount = 0

    if (this.state === 'half-open') {
      // Failed during half-open - reopen immediately
      this.transitionTo('open')
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo('open')
    }
  }

  /**
   * Check if we should attempt to reset from open state
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailure) return true
    return Date.now() - this.lastFailure.getTime() >= this.config.timeout
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    if (this.state === newState) return

    const oldState = this.state
    this.state = newState
    this.lastStateChange = new Date()

    logger.warn(`[CircuitBreaker:${this.name}] State change: ${oldState} → ${newState}`)

    if (newState === 'open') {
      this.onCircuitOpen()
    } else if (newState === 'closed') {
      this.onCircuitClose()
    }
  }

  /**
   * Called when circuit opens
   */
  private onCircuitOpen(): void {
    logger.error(`[CircuitBreaker:${this.name}] CIRCUIT OPEN — Trading halted!`)
    
    // Emit event for monitoring
    // alertService.send({ ... })
  }

  /**
   * Called when circuit closes
   */
  private onCircuitClose(): void {
    logger.info(`[CircuitBreaker:${this.name}] Circuit closed — Normal operation resumed`)
    this.failureCount = 0
    this.successCount = 0
  }

  /**
   * Force circuit to open (emergency)
   */
  forceOpen(): void {
    this.transitionTo('open')
    logger.error(`[CircuitBreaker:${this.name}] FORCED OPEN by admin`)
  }

  /**
   * Force circuit to close (recovery)
   */
  forceClose(): void {
    this.transitionTo('closed')
    logger.info(`[CircuitBreaker:${this.name}] FORCED CLOSED by admin`)
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state
  }

  /**
   * Get circuit status
   */
  getStatus(): {
    name: string
    state: CircuitState
    failureCount: number
    successCount: number
    lastFailure: Date | null
    lastStateChange: Date
    isHealthy: boolean
  } {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailure: this.lastFailure,
      lastStateChange: this.lastStateChange,
      isHealthy: this.state === 'closed',
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER INSTANCES
// ═══════════════════════════════════════════════════════════════

// Trading circuit breaker - strict settings
export const tradingCircuitBreaker = new CircuitBreaker('trading', {
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 30000, // 30 seconds
})

// Jupiter API circuit breaker
export const jupiterCircuitBreaker = new CircuitBreaker('jupiter', {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 60000, // 1 minute
})

// RPC circuit breaker
export const rpcCircuitBreaker = new CircuitBreaker('rpc', {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30000,
})

// Database circuit breaker
export const dbCircuitBreaker = new CircuitBreaker('database', {
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 10000, // 10 seconds
})

/**
 * Get all circuit breaker statuses
 */
export function getAllCircuitStatus(): ReturnType<CircuitBreaker['getStatus']>[] {
  return [
    tradingCircuitBreaker.getStatus(),
    jupiterCircuitBreaker.getStatus(),
    rpcCircuitBreaker.getStatus(),
    dbCircuitBreaker.getStatus(),
  ]
}

/**
 * Force all circuits open (emergency)
 */
export function emergencyOpenAll(): void {
  tradingCircuitBreaker.forceOpen()
  jupiterCircuitBreaker.forceOpen()
  rpcCircuitBreaker.forceOpen()
  logger.error('[CircuitBreaker] ALL CIRCUITS FORCED OPEN — EMERGENCY')
}

