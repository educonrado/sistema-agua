import { useState, useEffect, useCallback } from 'react'
import { validateConfiguration } from '../utils/validation'

/**
 * Custom hook for onboarding logic
 */
export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(true)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const electronAPI = typeof window !== 'undefined' ? window.electronAPI : null
  const [formData, setFormData] = useState({
    nombreJunta: '',
    costoAguaCruda: '',
    limiteConsumoBasico: '',
    costoTarifaBase: '',
    costoM3Excedente: '',
    adminPassword: 'admin123',
  })
  const [validationErrors, setValidationErrors] = useState({})

  /**
   * Check if onboarding is needed
   */
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!electronAPI) {
        setNeedsOnboarding(true)
        setLoading(false)
        return
      }

      try {
        const needs = await electronAPI.configNeedsOnboarding()
        setNeedsOnboarding(Boolean(needs))
      } catch (err) {
        console.error('Error checking onboarding:', err)
        setError('Error al verificar la configuración del sistema')
      } finally {
        setLoading(false)
      }
    }

    checkOnboarding()
  }, [electronAPI])

  /**
   * Handle form field change
   */
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
    // Clear field error when user starts typing
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }, [validationErrors])

  /**
   * Validate and submit form
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!electronAPI) {
      setError('La configuración solo está disponible dentro de la app de Electron.')
      setSubmitting(false)
      return
    }

    try {
      // Client-side validation
      const validation = validateConfiguration(formData)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        setSubmitting(false)
        return
      }

      // Server-side validation
      const serverValidation = await electronAPI.configValidate(formData)
      if (!serverValidation.isValid) {
        setValidationErrors(serverValidation.errors)
        setSubmitting(false)
        return
      }

      // Submit configuration
      const result = await electronAPI.configCreateInitial(formData)
      
      if (result) {
        setNeedsOnboarding(false)
        setFormData({
          nombreJunta: '',
          costoAguaCruda: '',
          limiteConsumoBasico: '',
          costoTarifaBase: '',
          costoM3Excedente: '',
          adminPassword: 'admin123',
        })
      }
    } catch (err) {
      console.error('Error submitting configuration:', err)
      setError(err.message || 'Error al guardar la configuración')
    } finally {
      setSubmitting(false)
    }
  }, [electronAPI, formData])

  return {
    needsOnboarding,
    loading,
    submitting,
    error,
    formData,
    validationErrors,
    handleFieldChange,
    handleSubmit,
  }
}
