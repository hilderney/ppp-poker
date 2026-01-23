/**
 * PostgresAdapter - Implementação do adapter usando Prisma + PostgreSQL
 */

import { PrismaClient } from '@prisma/client'
import type { IDatabaseAdapter } from './IDatabaseAdapter.js'

export class PostgresAdapter implements IDatabaseAdapter {
  private prisma: PrismaClient
  private inTransaction: boolean = false

  constructor() {
    this.prisma = new PrismaClient()
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect()
      console.log('✅ Connected to PostgreSQL via Prisma')
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
    console.log('✅ Disconnected from PostgreSQL')
  }

  async save<T>(entity: T, entityType: string): Promise<T> {
    try {
      const model = (this.prisma as any)[this._getModelName(entityType)]

      if (!model) {
        throw new Error(`Unknown entity type: ${entityType}`)
      }

      const entityObj = entity as any
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

  async findById<T>(id: string, entityType: string): Promise<T | null> {
    try {
      const model = (this.prisma as any)[this._getModelName(entityType)]

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

  async findMany<T>(
    entityType: string,
    where?: any
  ): Promise<T[]> {
    try {
      const model = (this.prisma as any)[this._getModelName(entityType)]

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

  async delete(id: string, entityType: string): Promise<boolean> {
    try {
      const model = (this.prisma as any)[this._getModelName(entityType)]

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

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    try {
      return await this.prisma.$queryRawUnsafe(sql, ...(params || []))
    } catch (error) {
      console.error('Error executing raw query:', error)
      throw error
    }
  }

  async beginTransaction(): Promise<void> {
    this.inTransaction = true
  }

  async commit(): Promise<void> {
    this.inTransaction = false
  }

  async rollback(): Promise<void> {
    this.inTransaction = false
  }

  /**
   * Helper para converter nome da entidade para nome do modelo Prisma
   */
  private _getModelName(entityType: string): string {
    // room -> Room, user -> User, vote -> Vote
    return entityType.charAt(0).toUpperCase() + entityType.slice(1)
  }
}
