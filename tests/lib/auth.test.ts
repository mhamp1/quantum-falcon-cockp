import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateLicense } from '@/lib/auth'

// Mock fetch
global.fetch = vi.fn()

describe('Auth System', () => {
  beforeEach(() => {
    // Reset ALL mocks including implementations (not just call history)
    vi.resetAllMocks()
    // Clear all localStorage to prevent test pollution
    localStorage.clear()
  })

  it('validates master key correctly', async () => {
    // Master key is validated locally - no fetch needed
    // The validateLicense function returns immediately for master keys
    const result = await validateLicense('QF-GODMODE-MHAMP1-2025')
    
    expect(result).toBeTruthy()
    expect(result?.valid).toBe(true)
    expect(result?.tier).toBe('lifetime')
    expect(result?.userId).toBe('master')
    // Verify fetch was NOT called (master key is local check)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects invalid license keys', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
    }
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

    // Use a key that definitely doesn't match master patterns
    const result = await validateLicense('INVALID-TEST-KEY-12345')
    
    // Should return null for invalid keys (non-master, failed API)
    expect(result).toBeNull()
  })

  it('handles network errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const result = await validateLicense('any-key')
    
    expect(result).toBeNull()
  })
})

