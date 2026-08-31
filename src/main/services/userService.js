import { getPrismaClient } from '../database.js'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Create a new user
 */
export async function createUser(userData) {
  try {
    const prisma = getPrismaClient()

    if (!userData.nombre || !userData.password) {
      throw new Error('Missing required user fields: nombre, password')
    }

    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS)

    return await prisma.usuario.create({
      data: {
        nombre: userData.nombre.trim(),
        email: userData.email?.trim(),
        passwordHash,
        rol: userData.rol || 'DIGITADOR',
        activo: userData.activo !== false,
      },
    })
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Get user by id
 */
export async function getUser(id) {
  try {
    const prisma = getPrismaClient()
    return await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    })
  } catch (error) {
    console.error('Error getting user:', error)
    throw error
  }
}

/**
 * Get user by nombre (for login)
 */
export async function getUserByNombre(nombre) {
  try {
    const prisma = getPrismaClient()
    return await prisma.usuario.findUnique({
      where: { nombre },
    })
  } catch (error) {
    console.error('Error getting user by nombre:', error)
    throw error
  }
}

/**
 * Verify user password
 */
export async function verifyPassword(plainPassword, passwordHash) {
  try {
    return await bcrypt.compare(plainPassword, passwordHash)
  } catch (error) {
    console.error('Error verifying password:', error)
    throw error
  }
}

/**
 * Update user
 */
export async function updateUser(id, userData) {
  try {
    const prisma = getPrismaClient()

    const updateData = {}
    if (userData.nombre !== undefined) updateData.nombre = userData.nombre.trim()
    if (userData.email !== undefined) updateData.email = userData.email?.trim()
    if (userData.rol !== undefined) updateData.rol = userData.rol
    if (userData.activo !== undefined) updateData.activo = userData.activo
    if (userData.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS)
    }

    return await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
      },
    })
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * Get all users
 */
export async function getAllUsers() {
  try {
    const prisma = getPrismaClient()
    return await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    })
  } catch (error) {
    console.error('Error getting all users:', error)
    throw error
  }
}

/**
 * Delete user
 */
export async function deleteUser(id) {
  try {
    const prisma = getPrismaClient()
    return await prisma.usuario.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}
