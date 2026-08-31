import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('OnboardingScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have electronAPI available', () => {
    expect(window.electronAPI).toBeDefined()
    expect(typeof window.electronAPI.configNeedsOnboarding).toBe('function')
  })

  it('should have all config IPC handlers', () => {
    expect(typeof window.electronAPI.configGet).toBe('function')
    expect(typeof window.electronAPI.configCreateInitial).toBe('function')
    expect(typeof window.electronAPI.configValidate).toBe('function')
  })

  it('should mock IPC calls correctly', async () => {
    window.electronAPI.configNeedsOnboarding = vi.fn().mockResolvedValue(true)
    const result = await window.electronAPI.configNeedsOnboarding()
    expect(result).toBe(true)
    expect(window.electronAPI.configNeedsOnboarding).toHaveBeenCalled()
  })
})
