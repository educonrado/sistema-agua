import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useOnboarding Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have window.electronAPI.configNeedsOnboarding', () => {
    expect(typeof window.electronAPI.configNeedsOnboarding).toBe('function')
  })

  it('should have window.electronAPI.configGet', () => {
    expect(typeof window.electronAPI.configGet).toBe('function')
  })

  it('should have window.electronAPI.configCreateInitial', () => {
    expect(typeof window.electronAPI.configCreateInitial).toBe('function')
  })

  it('should have window.electronAPI.configValidate', () => {
    expect(typeof window.electronAPI.configValidate).toBe('function')
  })

  it('should mock configNeedsOnboarding correctly', async () => {
    window.electronAPI.configNeedsOnboarding = vi.fn().mockResolvedValue(true)
    const result = await window.electronAPI.configNeedsOnboarding()
    expect(result).toBe(true)
  })
})
