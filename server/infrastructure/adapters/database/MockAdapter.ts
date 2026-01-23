/**
 * MockAdapter - Implementação mock do adapter para testes
 * Usa um Map em memória como "banco de dados"
 */

import type { IDatabaseAdapter } from './IDatabaseAdapter.js'

export class MockAdapter implements IDatabaseAdapter {
  private data: Map<string, Map<string, any>> = new Map()

  async connect(): Promise<void> {
    console.log('✅ Connected to Mock Database')
  }

  async disconnect(): Promise<void> {
    console.log('✅ Disconnected from Mock Database')
  }

  async save<T>(entity: T, entityType: string): Promise<T> {
    if (!this.data.has(entityType)) {
      this.data.set(entityType, new Map())
    }

    const entityObj = entity as any
    const store = this.data.get(entityType)!
    store.set(entityObj.id, entityObj)

    return entity
  }

  async findById<T>(id: string, entityType: string): Promise<T | null> {
    const store = this.data.get(entityType)
    if (!store) return null
    return store.get(id) || null
  }

  async findMany<T>(
    entityType: string,
    where?: any
  ): Promise<T[]> {
    const store = this.data.get(entityType)
    if (!store) return []

    let results = Array.from(store.values())

    // Simple filtering
    if (where) {
      results = results.filter((item) => {
        return Object.entries(where).every(
          ([key, value]) => item[key] === value
        )
      })
    }

    return results
  }

  async delete(id: string, entityType: string): Promise<boolean> {
    const store = this.data.get(entityType)
    if (!store) return false
    return store.delete(id)
  }

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    console.warn('⚠️ Raw query not supported in MockAdapter')
    return []
  }

  async beginTransaction(): Promise<void> {
    // No-op for mock
  }

  async commit(): Promise<void> {
    // No-op for mock
  }

  async rollback(): Promise<void> {
    // No-op for mock
  }
}
