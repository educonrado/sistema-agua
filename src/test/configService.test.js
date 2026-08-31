import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as configService from '../main/services/configService'
import * as database from '../main/database'
import bcrypt from 'bcryptjs'

// Mock Prisma
vi.mock('../main/database.js', () => ({
  getPrismaClient: vi.fn(),
}))

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}))

describe('Configuration Service', () => {
  let mockPrisma

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockPrisma = {
      configuracion: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      usuario: {
        create: vi.fn(),
      },
    }

    database.getPrismaClient.mockReturnValue(mockPrisma)
  })

  describe('createInitialConfiguration', () => {
    it('should create configuration and admin user', async () => {
      const configData = {
        nombreJunta: 'Test Junta',
        costoAguaCruda: 5.5,
        limiteConsumoBasico: 10,
        costoTarifaBase: 15,
        costoM3Excedente: 2.5,
        adminPassword: 'admin123',
      }

      mockPrisma.configuracion.create.mockResolvedValue({
        id: 1,
        ...configData,
      })

      mockPrisma.usuario.create.mockResolvedValue({
        id: 1,
        nombre: 'Administrador',
        email: 'admin@junta.local',
        passwordHash: 'hashed_password',
        rol: 'ADMINISTRADOR',
      })

      const result = await configService.createInitialConfiguration(configData)

      expect(result.config.id).toBe(1)
      expect(result.admin.nombre).toBe('Administrador')
      expect(mockPrisma.configuracion.create).toHaveBeenCalled()
      expect(mockPrisma.usuario.create).toHaveBeenCalled()
    })

    it('should reject configuration with missing fields', async () => {
      const incompleteData = {
        nombreJunta: 'Test Junta',
        // Missing other required fields
      }

      await expect(
        configService.createInitialConfiguration(incompleteData)
      ).rejects.toThrow()
    })

    it('should hash admin password', async () => {
      const configData = {
        nombreJunta: 'Test Junta',
        costoAguaCruda: 5.5,
        limiteConsumoBasico: 10,
        costoTarifaBase: 15,
        costoM3Excedente: 2.5,
        adminPassword: 'admin123',
      }

      mockPrisma.configuracion.create.mockResolvedValue({ id: 1 })
      mockPrisma.usuario.create.mockResolvedValue({ id: 1 })

      await configService.createInitialConfiguration(configData)

      expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 10)
    })

    it('should trim nombre junta', async () => {
      const configData = {
        nombreJunta: '  Test Junta  ',
        costoAguaCruda: 5.5,
        limiteConsumoBasico: 10,
        costoTarifaBase: 15,
        costoM3Excedente: 2.5,
      }

      mockPrisma.configuracion.create.mockResolvedValue({ id: 1 })
      mockPrisma.usuario.create.mockResolvedValue({ id: 1 })

      await configService.createInitialConfiguration(configData)

      expect(mockPrisma.configuracion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nombreJunta: 'Test Junta',
          }),
        })
      )
    })
  })

  describe('getConfiguration', () => {
    it('should return configuration', async () => {
      const mockConfig = {
        id: 1,
        nombreJunta: 'Test Junta',
        costoAguaCruda: 5.5,
        limiteConsumoBasico: 10,
        costoTarifaBase: 15,
        costoM3Excedente: 2.5,
      }

      mockPrisma.configuracion.findFirst.mockResolvedValue(mockConfig)

      const result = await configService.getConfiguration()

      expect(result).toEqual(mockConfig)
      expect(mockPrisma.configuracion.findFirst).toHaveBeenCalled()
    })

    it('should return null if no configuration exists', async () => {
      mockPrisma.configuracion.findFirst.mockResolvedValue(null)

      const result = await configService.getConfiguration()

      expect(result).toBeNull()
    })
  })

  describe('updateConfiguration', () => {
    it('should update configuration', async () => {
      const updateData = {
        nombreJunta: 'Updated Junta',
        costoAguaCruda: 6.5,
      }

      mockPrisma.configuracion.update.mockResolvedValue({
        id: 1,
        ...updateData,
      })

      const result = await configService.updateConfiguration(1, updateData)

      expect(result.nombreJunta).toBe('Updated Junta')
      expect(mockPrisma.configuracion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
        })
      )
    })

    it('should parse numeric strings to floats', async () => {
      const updateData = {
        costoAguaCruda: '6.5',
        limiteConsumoBasico: '10.5',
      }

      mockPrisma.configuracion.update.mockResolvedValue({ id: 1 })

      await configService.updateConfiguration(1, updateData)

      expect(mockPrisma.configuracion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            costoAguaCruda: 6.5,
            limiteConsumoBasico: 10.5,
          }),
        })
      )
    })
  })
})
