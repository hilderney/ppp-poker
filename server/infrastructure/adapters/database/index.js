/**
 * Database Adapter Factory e exports
 */

import { PostgresAdapter } from './PostgresAdapter.js'
import { MockAdapter } from './MockAdapter.js'

/**
 * Factory function para criar database adapters
 * @param {string} type - 'postgres' ou 'mock'
 * @returns {PostgresAdapter|MockAdapter}
 */
export function createDatabaseAdapter(type = 'postgres') {
  switch (type) {
    case 'mock':
      return new MockAdapter()
    case 'postgres':
    default:
      return new PostgresAdapter()
  }
}

export { PostgresAdapter, MockAdapter }
