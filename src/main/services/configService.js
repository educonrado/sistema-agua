import { getPrismaClient } from '../database.js'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Create initial configuration and admin user
 */
export async function createInitialConfiguration(configData) {
  try {
    const prisma = getPrismaClient()

    // Validate input
    if (!configData.nombreJunta || !configData.costoAguaCruda === undefined || 
        !configData.limiteConsumoBasico === undefined || 
        !configData.costoTarifaBase === undefined || 
        !configData.costoM3Excedente === undefined) {
      throw new Error('Missing required configuration fields')
    }

    // Create configuration
    const config = await prisma.configuracion.create({
      data: {
        nombreJunta: configData.nombreJunta.trim(),
        costoAguaCruda: parseFloat(configData.costoAguaCruda),
        limiteConsumoBasico: parseFloat(configData.limiteConsumoBasico),
        costoTarifaBase: parseFloat(configData.costoTarifaBase),
        costoM3Excedente: parseFloat(configData.costoM3Excedente),
      },
    })

    // Create admin user
    const adminPassword = configData.adminPassword || 'admin123'
    const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS)

    const admin = await prisma.usuario.create({
      data: {
        nombre: 'Administrador',
        email: configData.adminEmail || 'admin@junta.local',
        passwordHash,
        rol: 'ADMINISTRADOR',
        activo: true,
      },
    })

    return {
      config,
      admin: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
      },
    }
  } catch (error) {
    console.error('Error creating initial configuration:', error)
    throw error
  }
}

/**
 * Get configuration
 */
export async function getConfiguration() {
  try {
    const prisma = getPrismaClient()
    return await prisma.configuracion.findFirst()
  } catch (error) {
    console.error('Error getting configuration:', error)
    throw error
  }
}

/**
 * Update configuration
 */
export async function updateConfiguration(id, configData) {
  try {
    const prisma = getPrismaClient()
    return await prisma.configuracion.update({
      where: { id },
      data: {
        nombreJunta: configData.nombreJunta?.trim(),
        costoAguaCruda: configData.costoAguaCruda !== undefined ? parseFloat(configData.costoAguaCruda) : undefined,
        limiteConsumoBasico: configData.limiteConsumoBasico !== undefined ? parseFloat(configData.limiteConsumoBasico) : undefined,
        costoTarifaBase: configData.costoTarifaBase !== undefined ? parseFloat(configData.costoTarifaBase) : undefined,
        costoM3Excedente: configData.costoM3Excedente !== undefined ? parseFloat(configData.costoM3Excedente) : undefined,
      },
    })
  } catch (error) {
    console.error('Error updating configuration:', error)
    throw error
  }
}
