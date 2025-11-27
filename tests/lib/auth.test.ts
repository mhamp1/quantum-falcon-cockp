import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateLicense } from '@/lib/auth'

// Mock fetch
global.fetch = vi.fn()

describe('Auth System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates master key correctly', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ valid: true, tier: 'lifetime', userId: 'master' }),
    }
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

    const result = await validateLicense('QF-GODMODE-MHAMP1-2025')
    
    expect(result).toBeTruthy()
    expect(result?.valid).toBe(true)
    expect(result?.tier).toBe('lifetime')
  })

  it('rejects invalid license keys', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
    }
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

    const result = await validateLicense('invalid-key')
    
    expect(result).toBeNull()
  })

  it('handles network errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const result = await validateLicense('any-key')
    
    expect(result).toBeNull()
  })
})

