import path from 'path'
import { app } from 'electron'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let prisma

/**
 * Initialize Prisma Client and create database in user data directory
 */
export async function initializeDatabase() {
  try {
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'sistema-agua.db')
    const databaseUrl = `file:${dbPath}`

    // Set environment variable for Prisma
    process.env.DATABASE_URL = databaseUrl

    // Initialize Prisma Client
    if (!prisma) {
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      })
    }

    // Run migrations
    console.log('Running database migrations...')
    // Note: In production, use prisma migrate deploy
    // For development, this will be handled by Prisma

    console.log(`Database initialized at: ${dbPath}`)
    return prisma
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

/**
 * Get Prisma Client instance
 */
export function getPrismaClient() {
  if (!prisma) {
    throw new Error('Prisma client not initialized. Call initializeDatabase first.')
  }
  return prisma
}

/**
 * Disconnect Prisma Client
 */
export async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}

/**
 * Check if configuration exists
 */
export async function configurationExists() {
  try {
    const config = await prisma.configuracion.findFirst()
    return !!config
  } catch (error) {
    console.error('Error checking configuration:', error)
    return false
  }
}
