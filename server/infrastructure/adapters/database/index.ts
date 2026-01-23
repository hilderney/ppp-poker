/**
 * Database Adapter Factory e exports
 */

export type { IDatabaseAdapter, IQueryResult } from './IDatabaseAdapter.js'
export { PostgresAdapter } from './PostgresAdapter.js'
export { MockAdapter } from './MockAdapter.js'

export function createDatabaseAdapter(
  type: 'postgres' | 'mock' = 'postgres'
): any {
  switch (type) {
    case 'mock':
      const { MockAdapter } = await import('./MockAdapter.js')
      return new MockAdapter()
    case 'postgres':
    default:
      const { PostgresAdapter } = await import('./PostgresAdapter.js')
      return new PostgresAdapter()
  }
}
