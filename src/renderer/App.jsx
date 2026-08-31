import { useState, useEffect } from 'react'
import { OnboardingScreen } from './screens/OnboardingScreen'
import Dashboard from './pages/Dashboard'

function App() {
  const [needsOnboarding, setNeedsOnboarding] = useState(true)
  const [loading, setLoading] = useState(true)

  const electronAPI = typeof window !== 'undefined' ? window.electronAPI : null

  useEffect(() => {
    const checkConfiguration = async () => {
      if (!electronAPI) {
        setNeedsOnboarding(true)
        setLoading(false)
        return
      }

      try {
        const needs = await electronAPI.configNeedsOnboarding()
        setNeedsOnboarding(Boolean(needs))
      } catch (error) {
        console.error('Error checking configuration:', error)
        setNeedsOnboarding(true)
      } finally {
        setLoading(false)
      }
    }

    checkConfiguration()
  }, [electronAPI])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  // Block entire app until onboarding is complete
  if (needsOnboarding) {
    return <OnboardingScreen />
  }

  // After onboarding, show main application
  return <Dashboard />
}

export default App
