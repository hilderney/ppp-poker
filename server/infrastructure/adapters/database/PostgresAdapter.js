/**
 * PostgresAdapter - Implementação do adapter usando Prisma + PostgreSQL
 */

import { PrismaClient as Prisma } from '@prisma/client'

export class PostgresAdapter {
  constructor() {
    this.prisma = new Prisma()
    this.inTransaction = false
  }

  async connect() {
    try {
      await this.prisma.$connect()
      console.log('✅ Connected to PostgreSQL via Prisma')
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error)
      throw error
    }
  }

  async disconnect() {
    await this.prisma.$disconnect()
    console.log('✅ Disconnected from PostgreSQL')
  }

  async save(entity, entityType) {
    try {
      const model = this.prisma[this._getModelName(entityType)]

      if (!model) {
        throw new Error(`Unknown entity type: ${entityType}`)
      }

      const entityObj = entity
      const { id, ...data } = entityObj

      // Se tem ID, faz update. Senão, cria novo.
      if (id) {
        return await model.update({
          where: { id },
          data,
        })
      } else {
        return await model.create({
          data: entityObj,
        })
      }
    } catch (error) {
      console.error(`Error saving ${entityType}:`, error)
      throw error
    }
  }

  async findById(id, entityType) {
    try {
      const model = this.prisma[this._getModelName(entityType)]

      if (!model) {
        throw new Error(`Unknown entity type: ${entityType}`)
      }

      return await model.findUnique({
        where: { id },
      })
    } catch (error) {
      console.error(`Error finding ${entityType} by ID:`, error)
      throw error
    }
  }

  async findMany(entityType, where) {
    try {
      const model = this.prisma[this._getModelName(entityType)]

      if (!model) {
        throw new Error(`Unknown entity type: ${entityType}`)
      }

      return await model.findMany({
        where,
      })
    } catch (error) {
      console.error(`Error finding many ${entityType}:`, error)
      throw error
    }
  }

  async delete(id, entityType) {
    try {
      const model = this.prisma[this._getModelName(entityType)]

      if (!model) {
        throw new Error(`Unknown entity type: ${entityType}`)
      }

      await model.delete({
        where: { id },
      })
      return true
    } catch (error) {
      console.error(`Error deleting ${entityType}:`, error)
      throw error
    }
  }

  async query(sql, params) {
    try {
      return await this.prisma.$queryRawUnsafe(sql, ...(params || []))
    } catch (error) {
      console.error('Error executing raw query:', error)
      throw error
    }
  }

  async beginTransaction() {
    this.inTransaction = true
  }

  async commit() {
    this.inTransaction = false
  }

  async rollback() {
    this.inTransaction = false
  }

  /**
   * Cria um novo usuário
   */
  async createUser(userData) {
    try {
      return await this.prisma.user.create({
        data: userData
      })
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  /**
   * Obtém usuário por email
   */
  async getUserByEmail(email) {
    try {
      return await this.prisma.user.findUnique({
        where: { email }
      })
    } catch (error) {
      console.error('Error finding user by email:', error)
      throw error
    }
  }

  /**
   * Obtém usuário por ID
   */
  async getUserById(id) {
    try {
      return await this.prisma.user.findUnique({
        where: { id }
      })
    } catch (error) {
      console.error('Error finding user by ID:', error)
      throw error
    }
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id, userData) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: userData
      })
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  /**
   * Lista todos os usuários
   */
  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true
        }
      })
      return users
    } catch (error) {
      console.error('Error getting all users:', error)
      throw error
    }
  }

  /**
   * Converte nome da entidade para o nome do modelo Prisma
   * Ex: 'room' -> 'Room', 'user' -> 'User'
   */
  _getModelName(entityType) {
    return entityType.charAt(0).toUpperCase() + entityType.slice(1)
  }
}
