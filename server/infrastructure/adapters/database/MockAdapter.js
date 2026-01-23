/**
 * MockAdapter - Implementação mock do adapter para testes
 * Usa um Map em memória como "banco de dados"
 */

export class MockAdapter {
  constructor() {
    this.data = new Map()
  }

  async connect() {
    console.log('✅ Connected to Mock Database')
  }

  async disconnect() {
    console.log('✅ Disconnected from Mock Database')
  }

  async save(entity, entityType) {
    if (!this.data.has(entityType)) {
      this.data.set(entityType, new Map())
    }

    const entityObj = entity
    const store = this.data.get(entityType)
    store.set(entityObj.id, entityObj)

    return entity
  }

  async findById(id, entityType) {
    const store = this.data.get(entityType)
    if (!store) return null
    return store.get(id) || null
  }

  async findMany(entityType, where) {
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

  async delete(id, entityType) {
    const store = this.data.get(entityType)
    if (!store) return false
    return store.delete(id)
  }

  async query(sql, params) {
    console.warn('⚠️ Raw query not supported in MockAdapter')
    return []
  }

  async beginTransaction() {
    // No-op for mock
  }

  async commit() {
    // No-op for mock
  }

  async rollback() {
    // No-op for mock
  }
}
