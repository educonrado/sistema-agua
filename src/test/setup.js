import '@testing-library/jest-dom'
import { expect, afterEach, vi, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Make React available globally for JSX
global.React = React

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock electronAPI
global.window = {
  ...window,
  electronAPI: {
    configNeedsOnboarding: vi.fn(),
    configGet: vi.fn(),
    configCreateInitial: vi.fn(),
    configValidate: vi.fn(),
  },
}
