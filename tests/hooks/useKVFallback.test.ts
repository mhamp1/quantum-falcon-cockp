import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKVSafe } from '@/hooks/useKVFallback'

describe('useKVSafe Hook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns default value when key does not exist', () => {
    const { result } = renderHook(() => useKVSafe('test-key', 'default'))
    
    expect(result.current[0]).toBe('default')
  })

  it('saves and retrieves values from localStorage', () => {
    const { result } = renderHook(() => useKVSafe('test-key', 'default'))
    
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(result.current[0]).toBe('new-value')
    expect(localStorage.getItem('spark_kv_test-key')).toBeTruthy()
  })

  it('handles complex objects', () => {
    const testObj = { name: 'test', count: 42 }
    const { result } = renderHook(() => useKVSafe('test-obj', testObj))
    
    act(() => {
      result.current[1]({ name: 'updated', count: 100 })
    })
    
    expect(result.current[0]).toEqual({ name: 'updated', count: 100 })
  })
})

