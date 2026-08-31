import { ipcMain } from 'electron'
import { configurationExists, getPrismaClient } from './database.js'
import { createInitialConfiguration, getConfiguration } from './services/configService.js'

/**
 * Setup IPC handlers for configuration and onboarding
 */
export function setupConfigurationHandlers() {
  /**
   * Check if onboarding is needed
   */
  ipcMain.handle('config:needs-onboarding', async () => {
    try {
      const exists = await configurationExists()
      return !exists
    } catch (error) {
      console.error('Error checking onboarding need:', error)
      return true
    }
  })

  /**
   * Get current configuration
   */
  ipcMain.handle('config:get', async () => {
    try {
      return await getConfiguration()
    } catch (error) {
      console.error('Error getting configuration:', error)
      throw error
    }
  })

  /**
   * Create initial configuration (from onboarding)
   */
  ipcMain.handle('config:create-initial', async (event, configData) => {
    try {
      const result = await createInitialConfiguration(configData)
      return result
    } catch (error) {
      console.error('Error creating initial configuration:', error)
      throw new Error(error.message)
    }
  })

  /**
   * Validate configuration data
   */
  ipcMain.handle('config:validate', async (event, configData) => {
    try {
      const errors = {}

      if (!configData.nombreJunta || configData.nombreJunta.trim().length === 0) {
        errors.nombreJunta = 'Nombre de la junta es requerido'
      }

      if (configData.costoAguaCruda === null || configData.costoAguaCruda === undefined || configData.costoAguaCruda === '') {
        errors.costoAguaCruda = 'Costo del agua cruda es requerido'
      } else if (parseFloat(configData.costoAguaCruda) < 0) {
        errors.costoAguaCruda = 'El costo no puede ser negativo'
      }

      if (configData.limiteConsumoBasico === null || configData.limiteConsumoBasico === undefined || configData.limiteConsumoBasico === '') {
        errors.limiteConsumoBasico = 'Límite de consumo básico es requerido'
      } else if (parseFloat(configData.limiteConsumoBasico) < 0) {
        errors.limiteConsumoBasico = 'El límite no puede ser negativo'
      }

      if (configData.costoTarifaBase === null || configData.costoTarifaBase === undefined || configData.costoTarifaBase === '') {
        errors.costoTarifaBase = 'Costo de la tarifa base es requerido'
      } else if (parseFloat(configData.costoTarifaBase) < 0) {
        errors.costoTarifaBase = 'El costo no puede ser negativo'
      }

      if (configData.costoM3Excedente === null || configData.costoM3Excedente === undefined || configData.costoM3Excedente === '') {
        errors.costoM3Excedente = 'Costo del m³ excedente es requerido'
      } else if (parseFloat(configData.costoM3Excedente) < 0) {
        errors.costoM3Excedente = 'El costo no puede ser negativo'
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      }
    } catch (error) {
      console.error('Error validating configuration:', error)
      throw error
    }
  })
}
