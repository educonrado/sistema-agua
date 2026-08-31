/**
 * Validation utilities for configuration form
 */

export const validators = {
  /**
   * Validate nombre junta
   */
  nombreJunta: (value) => {
    if (!value || value.trim().length === 0) {
      return 'Nombre de la junta es requerido'
    }
    if (value.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres'
    }
    return null
  },

  /**
   * Validate cost (must be non-negative number)
   */
  cost: (value, fieldName = 'Costo') => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} es requerido`
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      return `${fieldName} debe ser un número válido`
    }
    if (num < 0) {
      return `${fieldName} no puede ser negativo`
    }
    return null
  },

  /**
   * Validate volume (must be non-negative number)
   */
  volume: (value, fieldName = 'Volumen') => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} es requerido`
    }
    const num = parseFloat(value)
    if (isNaN(num)) {
      return `${fieldName} debe ser un número válido`
    }
    if (num < 0) {
      return `${fieldName} no puede ser negativo`
    }
    if (num === 0) {
      return `${fieldName} debe ser mayor a 0`
    }
    return null
  },
}

/**
 * Validate entire form
 */
export function validateConfiguration(formData) {
  const errors = {}

  errors.nombreJunta = validators.nombreJunta(formData.nombreJunta)
  errors.costoAguaCruda = validators.cost(formData.costoAguaCruda, 'Costo del agua cruda')
  errors.limiteConsumoBasico = validators.volume(formData.limiteConsumoBasico, 'Límite de consumo básico')
  errors.costoTarifaBase = validators.cost(formData.costoTarifaBase, 'Costo de la tarifa base')
  errors.costoM3Excedente = validators.cost(formData.costoM3Excedente, 'Costo del m³ excedente')

  // Remove null errors
  Object.keys(errors).forEach((key) => {
    if (errors[key] === null) {
      delete errors[key]
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(value) {
  if (typeof value === 'string') {
    value = parseFloat(value)
  }
  return isNaN(value) ? '0.00' : parseFloat(value).toFixed(2)
}

/**
 * Format volume for display
 */
export function formatVolume(value) {
  if (typeof value === 'string') {
    value = parseFloat(value)
  }
  return isNaN(value) ? '0.000' : parseFloat(value).toFixed(3)
}
