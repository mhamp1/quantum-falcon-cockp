// Arena Battle Client — Real-time Battle Management
// November 21, 2025 — Quantum Falcon Cockpit

import type {
  LiveBattle,
  BattleEvent,
  SpectatorData,
  ChatMessage,
  ArenaEvent,
  PredictionBet
} from './types'

/**
 * WebSocket connection for live battle updates
 */
class BattleWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnects = 5
  private reconnectDelay = 1000
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map()

  constructor(private battleId: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const baseUrl = import.meta.env.VITE_BATTLE_WS_URL || (import.meta.env.PROD ? '' : 'ws://localhost:3001')
        if (!baseUrl) {
          reject(new Error('Battle server not configured'))
          return
        }
        const wsUrl = `${baseUrl}/battle/${this.battleId}`
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.info('🔗 Battle WS: Connected')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.emit(data.type, data)
          } catch (error) {
            console.error('❌ Battle WS: Failed to parse message', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('❌ Battle WS: Error', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.warn('📡 Battle WS: Disconnected')
          this.attemptReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnects) {
      console.error('❌ Battle WS: Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    setTimeout(() => {
      console.info(`🔄 Battle WS: Reconnecting (${this.reconnectAttempts}/${this.maxReconnects})`)
      this.connect()
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

/**
 * Fetch active battles
 */
export async function fetchActiveBattles(): Promise<LiveBattle[]> {
  try {
    const response = await fetch('/api/arena/battles/active')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('❌ Failed to fetch active battles', error)
    return []
  }
}

/**
 * Join a battle
 */
export async function joinBattle(battleId: string, strategyId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/arena/battles/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ battleId, strategyId })
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('❌ Failed to join battle', error)
    return { success: false, message: 'Failed to join battle' }
  }
}

/**
 * Create a new battle
 */
export async function createBattle(
  mode: 'duel' | 'tournament',
  stake: number,
  strategyId: string
): Promise<{ success: boolean; battleId?: string; message: string }> {
  try {
    const response = await fetch('/api/arena/battles/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, stake, strategyId })
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('❌ Failed to create battle', error)
    return { success: false, message: 'Failed to create battle' }
  }
}

/**
 * Fetch battle events
 */
export async function fetchBattleEvents(battleId: string): Promise<BattleEvent[]> {
  try {
    const response = await fetch(`/api/arena/battles/${battleId}/events`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('❌ Failed to fetch battle events', error)
    return []
  }
}

/**
 * Send chat message
 */
export async function sendChatMessage(battleId: string, message: string, type: 'chat' | 'taunt' | 'cheer' = 'chat'): Promise<boolean> {
  try {
    const response = await fetch(`/api/arena/battles/${battleId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, type })
    })
    return response.ok
  } catch (error) {
    console.error('❌ Failed to send chat message', error)
    return false
  }
}

/**
 * Place prediction bet
 */
export async function placePredictionBet(
  battleId: string,
  predictedWinner: string,
  amount: number
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/arena/predictions/bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ battleId, predictedWinner, amount })
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('❌ Failed to place prediction bet', error)
    return { success: false, message: 'Failed to place bet' }
  }
}

/**
 * Fetch arena events
 */
export async function fetchArenaEvents(): Promise<ArenaEvent[]> {
  try {
    const response = await fetch('/api/arena/events')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('❌ Failed to fetch arena events', error)
    return []
  }
}

/**
 * Battle WebSocket Manager
 */
export class BattleManager {
  private ws: BattleWebSocket | null = null
  private currentBattle: LiveBattle | null = null

  constructor(private battleId: string) {}

  async connect(): Promise<void> {
    this.ws = new BattleWebSocket(this.battleId)
    await this.ws.connect()

    // Set up event listeners
    this.ws.on('battle_update', (data) => {
      this.currentBattle = data.battle
      // Emit custom event for React components
      window.dispatchEvent(new CustomEvent('battle_update', { detail: data }))
    })

    this.ws.on('trade_executed', (data) => {
      window.dispatchEvent(new CustomEvent('trade_executed', { detail: data }))
    })

    this.ws.on('chat_message', (data) => {
      window.dispatchEvent(new CustomEvent('chat_message', { detail: data }))
    })
  }

  disconnect() {
    this.ws?.disconnect()
    this.ws = null
  }

  sendChat(message: string, type: 'chat' | 'taunt' | 'cheer' = 'chat') {
    this.ws?.send('chat', { message, type })
  }

  getCurrentBattle(): LiveBattle | null {
    return this.currentBattle
  }
}


