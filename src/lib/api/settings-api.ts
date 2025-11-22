interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export class SettingsAPI {
  private baseURL = ''
  private mockDelay = 800

  private async mockRequest<T>(data: T, delay = this.mockDelay): Promise<APIResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, delay))
    return {
      success: Math.random() > 0.1,
      data,
      message: 'Success'
    }
  }

  async updateNotificationSettings(settings: any): Promise<APIResponse> {
    return this.mockRequest(settings)
  }

  async updateAudioSettings(settings: any): Promise<APIResponse> {
    return this.mockRequest(settings)
  }

  async updateTradingSettings(settings: any): Promise<APIResponse> {
    return this.mockRequest(settings)
  }

  async updateSecuritySettings(settings: any): Promise<APIResponse> {
    return this.mockRequest(settings)
  }

  async updateNetworkSettings(settings: any): Promise<APIResponse> {
    return this.mockRequest(settings)
  }

  async updateDisplaySettings(settings: any): Promise<APIResponse> {
    return this.mockRequest(settings)
  }

  async updateThemeSettings(settings: any): Promise<APIResponse> {
    return this.mockRequest(settings)
  }

  async connectWallet(walletId: string): Promise<APIResponse<{ address: string }>> {
    // This method is now handled by the Solana wallet adapter
    // Kept for backward compatibility but should use useWallet hook instead
    if (typeof window !== 'undefined' && (window as any).solana) {
      try {
        const response = await (window as any).solana.connect()
        return {
          success: true,
          data: { address: response.publicKey.toString() },
          message: 'Wallet connected successfully'
        }
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to connect wallet'
        }
      }
    }
    
    return {
      success: false,
      error: 'No wallet adapter found. Please install a Solana wallet extension.'
    }
  }

  async disconnectWallet(walletId: string): Promise<APIResponse> {
    if (typeof window !== 'undefined' && (window as any).solana) {
      try {
        await (window as any).solana.disconnect()
      } catch (error) {
        console.error('Error disconnecting wallet:', error)
      }
    }
    return this.mockRequest({}, 500)
  }

  async setupAPIIntegration(integrationId: string, apiKey: string, apiSecret?: string): Promise<APIResponse> {
    return this.mockRequest({ integrationId, connected: true })
  }

  async testAPIConnection(integrationId: string): Promise<APIResponse<{ latency: number, status: string }>> {
    const latency = Math.floor(Math.random() * 200) + 50
    await new Promise(resolve => setTimeout(resolve, latency))
    return {
      success: true,
      data: { latency, status: 'Connected' },
      message: 'Connection test successful'
    }
  }

  async revokeSession(sessionId: string): Promise<APIResponse> {
    return this.mockRequest({ sessionId }, 600)
  }

  async revokeAllSessions(): Promise<APIResponse<{ revokedCount: number }>> {
    return this.mockRequest({ revokedCount: Math.floor(Math.random() * 3) + 1 }, 1200)
  }

  async getActiveSessions(): Promise<APIResponse<any[]>> {
    const sessions = [
      {
        id: 'current',
        deviceType: 'desktop',
        deviceName: 'Chrome on Windows',
        browser: 'Chrome 120',
        os: 'Windows 11',
        ip: '192.168.•.•',
        location: 'San Francisco, CA, USA',
        lastActive: Date.now(),
        loginTime: Date.now() - 3600000,
        isCurrent: true
      }
    ]
    return this.mockRequest(sessions, 400)
  }

  async getChangeLog(): Promise<APIResponse<any[]>> {
    const stored = localStorage.getItem('settings-change-log')
    const log = stored ? JSON.parse(stored) : []
    return {
      success: true,
      data: log
    }
  }

  async exportChangeLogCSV(): Promise<Blob> {
    const stored = localStorage.getItem('settings-change-log')
    const log = stored ? JSON.parse(stored) : []
    
    const headers = ['Date', 'Time', 'Setting', 'Old Value', 'New Value', 'Category']
    const rows = log.map((entry: any) => {
      const date = new Date(entry.timestamp)
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        entry.setting,
        entry.oldValue,
        entry.newValue,
        entry.category
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new Blob([csvContent], { type: 'text/csv' })
  }

  async initiateCheckout(tierId: string, price: number): Promise<APIResponse<{ checkoutUrl: string }>> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const checkoutUrl = `https://quantumfalcon.ai/checkout?tier=${tierId}&price=${price}`
    
    return {
      success: true,
      data: { checkoutUrl },
      message: 'Checkout session created'
    }
  }
}

export const settingsAPI = new SettingsAPI()
