import { describe, it, expect } from 'vitest'
import { validateConfiguration, validators, formatCurrency, formatVolume } from '../renderer/utils/validation'

describe('Validation Utils', () => {
  describe('validators.nombreJunta', () => {
    it('should reject empty nombre junta', () => {
      const result = validators.nombreJunta('')
      expect(result).toBeTruthy()
      expect(result).toContain('requerido')
    })

    it('should reject nombre junta less than 3 characters', () => {
      const result = validators.nombreJunta('AB')
      expect(result).toBeTruthy()
      expect(result).toContain('al menos 3 caracteres')
    })

    it('should accept valid nombre junta', () => {
      const result = validators.nombreJunta('Junta de Agua')
      expect(result).toBeNull()
    })
  })

  describe('validators.cost', () => {
    it('should reject empty cost', () => {
      const result = validators.cost('')
      expect(result).toBeTruthy()
    })

    it('should reject negative cost', () => {
      const result = validators.cost(-5)
      expect(result).toBeTruthy()
      expect(result).toContain('negativo')
    })

    it('should accept zero cost', () => {
      const result = validators.cost(0)
      expect(result).toBeNull()
    })

    it('should accept positive cost', () => {
      const result = validators.cost(10.5)
      expect(result).toBeNull()
    })

    it('should reject non-numeric cost', () => {
      const result = validators.cost('abc')
      expect(result).toBeTruthy()
      expect(result).toContain('número válido')
    })
  })

  describe('validators.volume', () => {
    it('should reject empty volume', () => {
      const result = validators.volume('')
      expect(result).toBeTruthy()
    })

    it('should reject negative volume', () => {
      const result = validators.volume(-5)
      expect(result).toBeTruthy()
      expect(result).toContain('negativo')
    })

    it('should reject zero volume', () => {
      const result = validators.volume(0)
      expect(result).toBeTruthy()
      expect(result).toContain('mayor a 0')
    })

    it('should accept positive volume', () => {
      const result = validators.volume(5.5)
      expect(result).toBeNull()
    })
  })

  describe('validateConfiguration', () => {
    const validData = {
      nombreJunta: 'Junta de Agua',
      costoAguaCruda: 5.5,
      limiteConsumoBasico: 10.5,
      costoTarifaBase: 15.0,
      costoM3Excedente: 2.5,
    }

    it('should accept valid configuration', () => {
      const result = validateConfiguration(validData)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should reject configuration with negative costs', () => {
      const invalidData = { ...validData, costoAguaCruda: -5 }
      const result = validateConfiguration(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors.costoAguaCruda).toBeTruthy()
    })

    it('should reject configuration with empty nombreJunta', () => {
      const invalidData = { ...validData, nombreJunta: '' }
      const result = validateConfiguration(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors.nombreJunta).toBeTruthy()
    })

    it('should validate all required fields', () => {
      const invalidData = {
        nombreJunta: 'Junta',
        costoAguaCruda: '',
        limiteConsumoBasico: '',
        costoTarifaBase: '',
        costoM3Excedente: '',
      }
      const result = validateConfiguration(invalidData)
      expect(result.isValid).toBe(false)
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    })
  })

  describe('formatCurrency', () => {
    it('should format number to 2 decimal places', () => {
      expect(formatCurrency(10.5)).toBe('10.50')
      expect(formatCurrency(10)).toBe('10.00')
      expect(formatCurrency(10.555)).toBe('10.55')
    })

    it('should handle invalid input', () => {
      expect(formatCurrency('abc')).toBe('0.00')
      expect(formatCurrency('')).toBe('0.00')
    })
  })

  describe('formatVolume', () => {
    it('should format number to 3 decimal places', () => {
      expect(formatVolume(10.5)).toBe('10.500')
      expect(formatVolume(10)).toBe('10.000')
      expect(formatVolume(10.5555)).toBe('10.556')
    })

    it('should handle invalid input', () => {
      expect(formatVolume('abc')).toBe('0.000')
      expect(formatVolume('')).toBe('0.000')
    })
  })
})
